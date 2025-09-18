import { NextResponse } from "next/server";
import { auditLogService } from "@/lib/services/auditLogService";

export async function GET() {
  try {
    const { data: logs, error } = await auditLogService.getAll({
      limit: 5,
    });

    if (error) {
      console.error("Error fetching recent logs:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch audit logs",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: logs || [],
    });
  } catch (error) {
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
