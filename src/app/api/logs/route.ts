/**
 * Audit logs API route (/api/logs).
 * GET endpoint to fetch recent system logs.
 * Uses auditLogService to retrieve last 5 logs from Supabase.
 * Returns JSON with success/data or error.
 */

import { NextResponse } from "next/server";
import { auditLogService } from "@/lib/services/auditLogService";

/**
 * GET handler - retrieves recent audit logs.
 * Fetches last 5 logs using auditLogService.getAll({ limit: 5 }).
 * Handles errors with console.log and 500 response.
 * @returns {NextResponse} JSON with logs or error
 */
export async function GET() {
  try {
    // Fetch recent logs from the service (limited to 5)
    const { data: logs, error } = await auditLogService.getAll({
      limit: 5,
    });

    if (error) {
      // Log error and return 500 response
      console.error("Error fetching recent logs:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch audit logs",
        },
        { status: 500 }
      );
    }

    // Success response with logs data
    return NextResponse.json({
      success: true,
      data: logs || [],
    });
  } catch (error) {
    // Catch unexpected errors and return 500
    console.error("Unexpected error fetching logs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
