import { getSupabaseClient } from "../supabase/client";
import { Database } from "../supabase/database.types";

// Type for AuditLog
export type AuditLog = Database["public"]["Tables"]["AuditLog"]["Row"];

// Type for AuditLog insert
export type AuditLogInsert = Database["public"]["Tables"]["AuditLog"]["Insert"];

// Type for AuditLog update
export type AuditLogUpdate = Database["public"]["Tables"]["AuditLog"]["Update"];

// Audit Log service
export const auditLogService = {
  // Get all audit logs with optional limit and filtering
  getAll: async (options?: {
    limit?: number;
    action?: string;
    userId?: string;
    assetId?: string;
  }): Promise<{ data: AuditLog[]; error: any }> => {
    try {
      const supabase = getSupabaseClient();
      let query = supabase
        .from("auditlog")
        .select("*")
        .order("timestamp", { ascending: false });

      // Apply filters if provided
      if (options?.action) {
        query = query.eq("action", options.action);
      }
      if (options?.userId) {
        query = query.eq("userId", options.userId);
      }
      if (options?.assetId) {
        query = query.eq("assetId", options.assetId);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching audit logs:", error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Unexpected error fetching audit logs:", error);
      return { data: [], error };
    }
  },

  // Get audit log by ID
  getById: async (
    id: string
  ): Promise<{ data: AuditLog | null; error: any }> => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("auditlog")
        .select("*")
        .eq("id", id)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Create new audit log entry
  create: async (
    auditLog: AuditLogInsert
  ): Promise<{ data: AuditLog | null; error: any }> => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("auditlog")
        .insert(auditLog)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Convenient helper functions for common audit logging actions
  logUserLogin: async (userId: string, details?: string): Promise<void> => {
    const now = new Date().toISOString();
    await auditLogService.create({
      action: "USER_LOGIN",
      userId,
      details: details || "User logged in",
      timestamp: now,
      updatedAt: now,
    });
  },

  logUserLogout: async (userId: string, details?: string): Promise<void> => {
    const now = new Date().toISOString();
    await auditLogService.create({
      action: "USER_LOGOUT",
      userId,
      details: details || "User logged out",
      timestamp: now,
      updatedAt: now,
    });
  },

  logAssetCreated: async (
    userId: string,
    assetId: string,
    assetName: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    await auditLogService.create({
      action: "ASSET_CREATED",
      userId,
      assetId,
      details: `Asset created: ${assetName}`,
      timestamp: now,
      updatedAt: now,
    });
  },

  logAssetUpdated: async (
    userId: string,
    assetId: string,
    assetName: string,
    changes?: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    await auditLogService.create({
      action: "ASSET_UPDATED",
      userId,
      assetId,
      details: changes
        ? `Asset updated: ${assetName} - ${changes}`
        : `Asset updated: ${assetName}`,
      timestamp: now,
      updatedAt: now,
    });
  },

  logAssetDeleted: async (
    userId: string,
    assetId: string,
    assetName: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    await auditLogService.create({
      action: "ASSET_DELETED",
      userId,
      assetId,
      details: `Asset deleted: ${assetName}`,
      timestamp: now,
      updatedAt: now,
    });
  },

  logAssetCheckedOut: async (
    userId: string,
    assetId: string,
    assetName: string,
    assignedTo?: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    await auditLogService.create({
      action: "ASSET_CHECKED_OUT",
      userId,
      assetId,
      details: assignedTo
        ? `Asset checked out: ${assetName} to ${assignedTo}`
        : `Asset checked out: ${assetName}`,
      timestamp: now,
      updatedAt: now,
    });
  },

  logAssetCheckedIn: async (
    userId: string,
    assetId: string,
    assetName: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    await auditLogService.create({
      action: "ASSET_CHECKED_IN",
      userId,
      assetId,
      details: `Asset checked in: ${assetName}`,
      timestamp: now,
      updatedAt: now,
    });
  },

  logQRCodeScanned: async (
    userId: string,
    assetId?: string,
    qrData?: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    await auditLogService.create({
      action: "QR_CODE_SCANNED",
      userId,
      assetId,
      details: assetId
        ? `QR code scanned for asset: ${assetId}`
        : qrData
        ? `QR code scanned: ${qrData}`
        : "QR code scanned",
      timestamp: now,
      updatedAt: now,
    });
  },

  logInspectionCompleted: async (
    userId: string,
    assetId: string,
    assetName: string,
    result?: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    await auditLogService.create({
      action: "INSPECTION_COMPLETED",
      userId,
      assetId,
      details: result
        ? `Inspection completed for ${assetName}: ${result}`
        : `Inspection completed for ${assetName}`,
      timestamp: now,
      updatedAt: now,
    });
  },

  logError: async (
    userId: string | null,
    action: string,
    error: string,
    assetId?: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    await auditLogService.create({
      action: `ERROR_${action}`,
      userId,
      assetId,
      details: `Error in ${action}: ${error}`,
      timestamp: now,
      updatedAt: now,
    });
  },

  logSystemEvent: async (
    action: string,
    details: string,
    assetId?: string
  ): Promise<void> => {
    const now = new Date().toISOString();
    await auditLogService.create({
      action: `SYSTEM_${action}`,
      userId: null, // System events don't have a user
      assetId,
      details,
      timestamp: now,
      updatedAt: now,
    });
  },

  // Helper function to determine log level from action
  getLogLevel: (action: string): "INFO" | "WARN" | "ERROR" => {
    const lowerAction = action.toLowerCase();

    if (
      lowerAction.includes("error") ||
      lowerAction.includes("fail") ||
      lowerAction.includes("delete") ||
      lowerAction.includes("critical")
    ) {
      return "ERROR";
    }

    if (
      lowerAction.includes("warn") ||
      lowerAction.includes("timeout") ||
      lowerAction.includes("retry") ||
      lowerAction.includes("overdue")
    ) {
      return "WARN";
    }

    return "INFO";
  },

  // Helper function to format audit log for UI display
  formatForUI: (
    auditLog: AuditLog
  ): {
    id: string;
    timestamp: string;
    level: "INFO" | "WARN" | "ERROR";
    message: string;
    user: string;
    action: string;
    assetId: string | null;
    details: string | null;
  } => {
    const level = auditLogService.getLogLevel(auditLog.action);
    const message = auditLog.details
      ? `${auditLog.action}: ${auditLog.details}`
      : auditLog.action;

    return {
      id: auditLog.id,
      timestamp: auditLog.timestamp,
      level,
      message,
      user: auditLog.userId || "system",
      action: auditLog.action,
      assetId: auditLog.assetId,
      details: auditLog.details,
    };
  },
};
