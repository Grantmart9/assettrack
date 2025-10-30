export async function generateStaticParams() {
  // Return an empty array since this is a dynamic route that doesn't need static generation
  return [];
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // In a real implementation, this would generate a QR code image
  // For now, we'll return a placeholder response
  return new Response(
    JSON.stringify({
      assetId: id,
      qrCode: `QR_CODE_${id}`,
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
