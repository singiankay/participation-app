import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Only allow this in production and from same origin
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.json(
      { error: "Not available in development" },
      { status: 403 }
    );
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Check if request is from same origin
  const isSameOrigin =
    origin?.includes("participation-app.vercel.app") ||
    referer?.includes("participation-app.vercel.app");

  if (!isSameOrigin) {
    return NextResponse.json({ error: "Unauthorized origin" }, { status: 403 });
  }

  const apiKeys = process.env.API_KEYS;
  if (!apiKeys) {
    return NextResponse.json(
      { error: "API keys not configured" },
      { status: 500 }
    );
  }

  // Return the first API key
  const firstApiKey = apiKeys.split(",")[0].trim();

  return NextResponse.json({ apiKey: firstApiKey });
}
