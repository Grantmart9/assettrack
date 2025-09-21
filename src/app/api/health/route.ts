/**
 * Health check API route (/api/health).
 * Simple GET endpoint to verify application status.
 * Returns JSON with status, timestamp, and version.
 * Used for monitoring and load balancer health checks.
 */

export async function GET() {
  /**
   * GET handler - returns application health status.
   * No parameters required; static response.
   * @returns {Response} JSON with health info
   */
  return new Response(
    JSON.stringify({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
