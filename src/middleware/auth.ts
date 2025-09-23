import { NextRequest, NextResponse } from "next/server";

interface AuthConfig {
  apiKeyHeader: string;
  allowedKeys: string[];
  requireAuth: boolean;
}

const defaultAuthConfig: AuthConfig = {
  apiKeyHeader: "X-API-Key",
  allowedKeys: process.env.API_KEYS?.split(",") || [],
  requireAuth: process.env.NODE_ENV === "production",
};

export function createAuthMiddleware(config: Partial<AuthConfig> = {}) {
  const authConfig = { ...defaultAuthConfig, ...config };

  return function authMiddleware(request: NextRequest): NextResponse | null {
    // Skip authentication in development if not required
    if (!authConfig.requireAuth) {
      return null;
    }

    // Skip authentication for OPTIONS requests (CORS preflight)
    if (request.method === "OPTIONS") {
      return null;
    }

    // Skip authentication for same-origin requests (frontend)
    const origin = request.headers.get("origin");
    const referer = request.headers.get("referer");
    const isSameOrigin =
      origin?.includes("participation-app.vercel.app") ||
      referer?.includes("participation-app.vercel.app");

    if (isSameOrigin) {
      console.log("Same-origin request, skipping authentication");
      return null;
    }

    // For external requests, require API key
    const apiKey = request.headers.get(authConfig.apiKeyHeader);

    if (!apiKey) {
      console.log("No API key provided in external request");
      return NextResponse.json(
        {
          error: "Authentication required",
          message: `Missing ${authConfig.apiKeyHeader} header`,
        },
        { status: 401 }
      );
    }

    if (!authConfig.allowedKeys.includes(apiKey)) {
      console.log("Invalid API key provided");
      return NextResponse.json(
        {
          error: "Authentication failed",
          message: "Invalid API key",
        },
        { status: 401 }
      );
    }

    console.log("External request authenticated successfully");
    return null;
  };
}

// Pre-configured auth middleware
export const authMiddleware = createAuthMiddleware();

// Development auth middleware (disabled)
export const devAuthMiddleware = createAuthMiddleware({
  requireAuth: false,
});

// Production auth middleware (strict)
export const prodAuthMiddleware = createAuthMiddleware({
  requireAuth: true,
});

// Helper function to generate API keys
export function generateApiKey(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Helper function to create multiple API keys
export function generateMultipleApiKeys(count: number): string[] {
  return Array.from({ length: count }, () => generateApiKey());
}
