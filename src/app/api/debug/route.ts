import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Only allow this in production for debugging
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json(
      { error: "Debug endpoint only available in production" },
      { status: 403 }
    );
  }

  const apiKeys = process.env.API_KEYS;
  const apiKeysArray = apiKeys?.split(",") || [];

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    apiKeys: {
      isSet: !!apiKeys,
      length: apiKeys?.length || 0,
      count: apiKeysArray.length,
      preview: apiKeys?.substring(0, 30) + "..." || "NOT SET",
      keys: apiKeysArray.map((key, index) => ({
        index,
        length: key.length,
        preview: key.substring(0, 10) + "...",
        trimmed: key.trim().length,
      })),
    },
    request: {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    },
  });
}
