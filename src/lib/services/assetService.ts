// Import Supabase client utility for database operations
import { getSupabaseClient } from "../supabase/client";

// Import IndexedDB service for offline data caching
import { indexedDBService } from "./indexedDBService";

// Import database types generated from Supabase schema
import { Database } from "../supabase/database.types";

// Import audit log service for logging user actions
import { auditLogService } from "./auditLogService";

// Extend the base Asset row type with the custom 'qr' field to match our database schema
// This type represents a complete asset record as stored in the database
export type Asset = Database["public"]["Tables"]["Asset"]["Row"] & {
  qr: string | null; // QR code value for asset identification
};

// Use the database insert type directly - the database schema already includes qr field
export type AssetInsert = Database["public"]["Tables"]["Asset"]["Insert"];

// Use the database update type directly - the database schema already includes qr field
export type AssetUpdate = Database["public"]["Tables"]["Asset"]["Update"];

// AssetService - central service for all asset-related operations: CRUD, QR handling, assignments, with offline support and audit logging
export const assetService = {
  /**
   * Get all assets - primary fetch method, tries Supabase first, falls back to IndexedDB for offline scenarios.
   * This method provides offline-first functionality by attempting to fetch from the remote database first,
   * then falling back to local IndexedDB storage if the remote request fails.
   *
   * @returns {Promise<{ data: Asset[]; error: any }>} Promise resolving to assets array and any error
   */
  getAll: async (): Promise<{ data: Asset[]; error: any }> => {
    try {
      // First try to get from Supabase (remote database)
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("asset").select("*");

      // If successful, return the data
      if (!error && data) {
        return { data, error: null };
      }

      // If Supabase fails, fallback to IndexedDB (local storage)
      const assets = await indexedDBService.getAssets();
      return { data: assets as Asset[], error: null };
    } catch (error) {
      // If all else fails, return empty array with the error
      return { data: [], error };
    }
  },

  /**
   * Get last N assets ordered by updatedAt - optimized query for inspection dashboard showing recent activity.
   * This method is designed for dashboard displays that need to show recently modified assets.
   * Includes debug logging for development troubleshooting.
   *
   * @param {number} limit - Number of assets to return (default: 10)
   * @returns {Promise<{ data: Asset[]; error: any }>} Promise resolving to recent assets array and any error
   */
  getLastNAssets: async (
    limit: number = 10
  ): Promise<{ data: Asset[]; error: any }> => {
    try {
      // Debug logging for development
      console.log(`🔍 DEBUG: Fetching last ${limit} assets from Supabase`);
      const supabase = getSupabaseClient();

      // Query Supabase for most recently updated assets
      const { data, error } = await supabase
        .from("asset")
        .select("*")
        .order("updatedAt", { ascending: false })
        .limit(limit);

      // Debug logging for development
      console.log(
        `✅ DEBUG: getLastNAssets - Fetched ${data?.length || 0} assets`
      );
      console.log("📊 DEBUG: getLastNAssets sample data:", data?.slice(0, 2));

      // If successful, return the data
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
      // Error logging for development
      console.error("🚨 DEBUG: Error in getLastNAssets:", error);
      return { data: [], error };
    }
  },

  /**
   * Get asset by ID - fetches a single asset by its UUID primary key, handles potential duplicates by returning the most recent.
   * This method is used when you need to retrieve a specific asset by its unique identifier.
   * Includes debug logging and handles edge cases like duplicate records.
   *
   * @param {string} id - The UUID of the asset to retrieve
   * @returns {Promise<{ data: Asset | null; error: any }>} Promise resolving to single asset or null, with any error
   */
  getById: async (id: string): Promise<{ data: Asset | null; error: any }> => {
    // Debug logging for development
    console.log("DEBUG getById: Querying for ID:", id);
    const supabase = getSupabaseClient();

    // Query Supabase for asset by ID, ordered by most recently updated
    const { data, error } = await supabase
      .from("asset")
      .select("*")
      .eq("id", id)
      .order("updatedAt", { ascending: false });

    // Debug logging for development
    console.log("DEBUG getById response:", {
      dataLength: data?.length || 0,
      error: error?.message,
    });

    // Handle query errors
    if (error) {
      return { data: null, error };
    }

    // Handle successful response
    if (data && data.length > 0) {
      // Warn if multiple records found (shouldn't happen with UUID primary key)
      if (data.length > 1) {
        console.warn(
          "WARNING: Multiple assets found for ID:",
          id,
          "- returning the most recent"
        );
      }
      return { data: data[0], error: null };
    } else {
      // No asset found with this ID
      return { data: null, error: { message: "No asset found" } };
    }
  },

  // Get asset by QR value - fetches a single asset by the QR slug stored in the 'qr' column, handles duplicates by returning the most recent
  getByQr: async (
    qrValue: string
  ): Promise<{ data: Asset | null; error: any }> => {
    console.log("DEBUG getByQr: Querying for QR:", qrValue);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("asset")
      .select("*")
      .eq("qr", qrValue)
      .order("updatedAt", { ascending: false });
    console.log("DEBUG getByQr response:", {
      dataLength: data?.length || 0,
      error: error?.message,
    });
    if (error) {
      return { data: null, error };
    }
    if (data && data.length > 0) {
      if (data.length > 1) {
        console.warn(
          "WARNING: Multiple assets found for QR:",
          qrValue,
          "- returning the most recent"
        );
      }
      return { data: data[0], error: null };
    } else {
      return { data: null, error: { message: "No asset found for QR" } };
    }
  },

  // Get asset by name - fetches a single asset by name, assuming names are unique
  getByName: async (
    name: string
  ): Promise<{ data: Asset | null; error: any }> => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("asset")
      .select("*")
      .eq("name", name)
      .single();
    return { data, error };
  },

  // Create new asset - inserts new asset into Supabase, syncs to IndexedDB, and stores QR if provided
  create: async (
    asset: AssetInsert
  ): Promise<{ data: Asset | null; error: any }> => {
    try {
      // TODO: Fix Supabase type issues - temporarily disabled
      console.log(
        "Asset creation temporarily disabled due to type issues:",
        asset
      );
      return {
        data: null,
        error: { message: "Asset creation temporarily disabled" },
      };

      // Original implementation (commented out due to type issues):
      // const supabase = getSupabaseClient();
      // const { data, error } = await supabase
      //   .from("asset")
      //   .insert(asset)
      //   .select()
      //   .single();

      // if (error) {
      //   return { data: null, error };
      // }

      // await indexedDBService.saveAsset(asset);
      // return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update asset - updates existing asset in Supabase by ID, can update QR if changed
  update: async (
    id: string,
    asset: AssetUpdate
  ): Promise<{ data: Asset | null; error: any }> => {
    // TODO: Fix Supabase type issues - temporarily disabled
    console.log("Asset update temporarily disabled due to type issues:", {
      id,
      asset,
    });
    return {
      data: null,
      error: { message: "Asset update temporarily disabled" },
    };

    // Original implementation (commented out due to type issues):
    // const supabase = getSupabaseClient();
    // const { data, error } = await supabase
    //   .from("asset")
    //   .update(asset)
    //   .eq("id", id)
    //   .select()
    //   .single();
    // return { data, error };
  },

  // Delete asset - deletes asset from Supabase by ID
  delete: async (id: string): Promise<{ error: any }> => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("asset").delete().eq("id", id);
    return { error };
  },

  // Generate QR code for asset - placeholder; in production, integrate with a QR library to generate actual QR image or URL
  generateQRCode: async (
    assetId: string
  ): Promise<{ data: string; error: any }> => {
    // In a real implementation, this would generate a QR code
    // For now, we'll return a placeholder
    return { data: `QR_CODE_${assetId}`, error: null };
  },

  // Assign asset to user/site/vehicle - creates an assignment record for check-out, syncs to IndexedDB
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

  // Check in asset (with audit logging) - updates the latest open assignment to checked-in state and logs the action
  checkIn: async (
    assetId: string,
    userId?: string,
    assetName?: string
  ): Promise<{ data: any; error: any }> => {
    const supabase = getSupabaseClient();

    try {
      // TODO: Fix Supabase type issues - temporarily disabled
      console.log(
        "Asset check-in temporarily disabled due to type issues:",
        assetId
      );
      return {
        data: null,
        error: { message: "Asset check-in temporarily disabled" },
      };
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
        } catch (auditError) {}
      }
      return { data: null, error };
    }
  },

  // Check out asset (with audit logging) - creates a new assignment record for the check-out and logs the action
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
