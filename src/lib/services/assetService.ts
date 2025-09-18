import { getSupabaseClient } from "../supabase/client";
import { indexedDBService } from "./indexedDBService";
import { Database } from "../supabase/database.types";
import { auditLogService } from "./auditLogService";

// Type for Asset
export type Asset = Database["public"]["Tables"]["Asset"]["Row"];

// Type for Asset insert
export type AssetInsert = Database["public"]["Tables"]["Asset"]["Insert"];

// Type for Asset update
export type AssetUpdate = Database["public"]["Tables"]["Asset"]["Update"];

// Asset service
export const assetService = {
  // Get all assets
  getAll: async (): Promise<{ data: Asset[]; error: any }> => {
    try {
      // First try to get from Supabase
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("asset").select("*");

      if (!error && data) {
        return { data, error: null };
      }

      // If Supabase fails, fallback to IndexedDB
      const assets = await indexedDBService.getAssets();
      return { data: assets as Asset[], error: null };
    } catch (error) {
      // If all else fails, return empty array
      return { data: [], error };
    }
  },

  // Get last N assets ordered by updatedAt (optimized for inspections)
  getLastNAssets: async (
    limit: number = 10
  ): Promise<{ data: Asset[]; error: any }> => {
    try {
      console.log(`🔍 DEBUG: Fetching last ${limit} assets from Supabase`);
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("asset")
        .select("*")
        .order("updatedAt", { ascending: false })
        .limit(limit);

      console.log(
        `✅ DEBUG: getLastNAssets - Fetched ${data?.length || 0} assets`
      );
      console.log("📊 DEBUG: getLastNAssets sample data:", data?.slice(0, 2));

      if (!error && data) {
        return { data, error: null };
      }

      // If Supabase fails, fallback to IndexedDB with manual sorting
      console.log("⚠️ DEBUG: Supabase failed, falling back to IndexedDB");
      const assets = await indexedDBService.getAssets();
      const sortedAssets = (assets as Asset[])
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
        )
        .slice(0, limit);
      return { data: sortedAssets, error: null };
    } catch (error) {
      console.error("🚨 DEBUG: Error in getLastNAssets:", error);
      return { data: [], error };
    }
  },

  // Get asset by ID
  getById: async (id: string): Promise<{ data: Asset | null; error: any }> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("asset")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  // Create new asset
  create: async (
    asset: AssetInsert
  ): Promise<{ data: Asset | null; error: any }> => {
    try {
      const supabase = getSupabaseClient();
      // Save to Supabase first
      const { data, error } = await supabase
        .from("asset")
        .insert(asset)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      // Also save to IndexedDB for offline support
      await indexedDBService.saveAsset(asset);

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update asset
  update: async (
    id: string,
    asset: AssetUpdate
  ): Promise<{ data: Asset | null; error: any }> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("asset")
      .update(asset)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  // Delete asset
  delete: async (id: string): Promise<{ error: any }> => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("asset").delete().eq("id", id);
    return { error };
  },

  // Generate QR code for asset
  generateQRCode: async (
    assetId: string
  ): Promise<{ data: string; error: any }> => {
    // In a real implementation, this would generate a QR code
    // For now, we'll return a placeholder
    return { data: `QR_CODE_${assetId}`, error: null };
  },

  // Assign asset to user/site/vehicle
  assign: async (
    assetId: string,
    assignment: any
  ): Promise<{ data: any; error: any }> => {
    try {
      const supabase = getSupabaseClient();
      // Save assignment to IndexedDB for offline support
      await indexedDBService.saveAssignment(assignment);

      // Also save to Supabase
      const { data, error } = await supabase
        .from("Assignment")
        .insert(assignment)
        .select()
        .single();

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Check in asset (with audit logging)
  checkIn: async (
    assetId: string,
    userId?: string,
    assetName?: string
  ): Promise<{ data: any; error: any }> => {
    const supabase = getSupabaseClient();

    try {
      // Update the assignment record in Supabase
      const { data, error } = await supabase
        .from("Assignment")
        .update({ inAt: new Date().toISOString() })
        .eq("assetId", assetId)
        .is("inAt", null) // Only update assignments that haven't been checked in yet
        .select()
        .single();

      if (error) {
        // Log failed check-in
        if (userId) {
          try {
            await auditLogService.logError(
              userId,
              "ASSET_CHECKIN",
              `Failed to check in asset: ${error.message}`,
              assetId
            );
          } catch (auditError) {
            console.error("Failed to log check-in error:", auditError);
          }
        }
        return { data, error };
      }

      // Log successful check-in
      if (userId) {
        try {
          await auditLogService.logAssetCheckedIn(
            userId,
            assetId,
            assetName || `Asset ${assetId}`
          );
        } catch (auditError) {
          console.error("Failed to log asset check-in:", auditError);
        }
      }

      return { data, error: null };
    } catch (error) {
      // Log unexpected error
      if (userId) {
        try {
          await auditLogService.logError(
            userId,
            "ASSET_CHECKIN",
            `Unexpected error checking in asset: ${error}`,
            assetId
          );
        } catch (auditError) {
          console.error("Failed to log check-in error:", auditError);
        }
      }
      return { data: null, error };
    }
  },

  // Check out asset (with audit logging)
  checkOut: async (
    assetId: string,
    assignment: any,
    userId?: string,
    assetName?: string
  ): Promise<{ data: any; error: any }> => {
    try {
      const supabase = getSupabaseClient();
      // Save assignment to IndexedDB for offline support
      await indexedDBService.saveAssignment(assignment);

      // Also save to Supabase
      const { data, error } = await supabase
        .from("Assignment")
        .insert(assignment)
        .select()
        .single();

      if (error) {
        // Log failed check-out
        if (userId) {
          try {
            await auditLogService.logError(
              userId,
              "ASSET_CHECKOUT",
              `Failed to check out asset: ${error.message}`,
              assetId
            );
          } catch (auditError) {
            console.error("Failed to log check-out error:", auditError);
          }
        }
        return { data: null, error };
      }

      // Log successful check-out
      if (userId) {
        try {
          await auditLogService.logAssetCheckedOut(
            userId,
            assetId,
            assetName || `Asset ${assetId}`,
            assignment.assignedTo
          );
        } catch (auditError) {
          console.error("Failed to log asset check-out:", auditError);
        }
      }

      return { data, error: null };
    } catch (error) {
      // Log unexpected error
      if (userId) {
        try {
          await auditLogService.logError(
            userId,
            "ASSET_CHECKOUT",
            `Unexpected error checking out asset: ${error}`,
            assetId
          );
        } catch (auditError) {
          console.error("Failed to log check-out error:", auditError);
        }
      }
      return { data: null, error };
    }
  },
};
