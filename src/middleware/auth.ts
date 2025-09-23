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

    // Comprehensive logging for debugging
    console.log("🔐 Auth Middleware Debug:", {
      environment: process.env.NODE_ENV,
      apiKeysEnv: process.env.API_KEYS ? "SET" : "NOT SET",
      apiKeysLength: process.env.API_KEYS?.length || 0,
      apiKeysPreview:
        process.env.API_KEYS?.substring(0, 20) + "..." || "NOT SET",
      allowedKeysCount: authConfig.allowedKeys.length,
      allowedKeysPreview: authConfig.allowedKeys.map(
        (key) => key.substring(0, 10) + "..."
      ),
      requestMethod: request.method,
      requestUrl: request.url,
      userAgent: request.headers.get("user-agent")?.substring(0, 50) + "...",
      referer: request.headers.get("referer"),
      allHeaders: Object.fromEntries(request.headers.entries()),
    });

    const apiKey = request.headers.get(authConfig.apiKeyHeader);

    if (!apiKey) {
      console.log("❌ No API key provided in request");
      return NextResponse.json(
        {
          error: "Authentication required",
          message: `Missing ${authConfig.apiKeyHeader} header`,
        },
        { status: 401 }
      );
    }

    console.log("🔑 API Key received:", {
      keyLength: apiKey.length,
      keyPreview: apiKey.substring(0, 10) + "...",
      isInAllowedKeys: authConfig.allowedKeys.includes(apiKey),
    });

    if (!authConfig.allowedKeys.includes(apiKey)) {
      console.log("❌ Invalid API key provided");
      return NextResponse.json(
        {
          error: "Authentication failed",
          message: "Invalid API key",
        },
        { status: 401 }
      );
    }

    console.log("✅ Authentication successful");
    // Authentication successful
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
