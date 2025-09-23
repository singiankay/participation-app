import { NextRequest, NextResponse } from "next/server";

interface CorsConfig {
  origin: string | string[] | boolean;
  methods: string[];
  allowedHeaders: string[];
  credentials: boolean;
  maxAge?: number;
}

const defaultCorsConfig: CorsConfig = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.ALLOWED_ORIGINS?.split(",") || [
          "https://participation-app.vercel.app",
        ]
      : [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://127.0.0.1:3000",
        ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

export function createCorsMiddleware(config: Partial<CorsConfig> = {}) {
  const corsConfig = { ...defaultCorsConfig, ...config };

  return function corsMiddleware(request: NextRequest): NextResponse | null {
    const origin = request.headers.get("origin");
    const method = request.method;

    if (method === "OPTIONS") {
      return handlePreflightRequest(origin, corsConfig);
    }

    return handleActualRequest();
  };
}

function handlePreflightRequest(
  origin: string | null,
  config: CorsConfig
): NextResponse {
  // Handle test environment where NextResponse might not be available
  if (process.env.NODE_ENV === "test") {
    const response = {
      status: 200,
      headers: {
        set: jest.fn(),
      },
    } as unknown as NextResponse;
    setCorsHeaders(response, origin, config);
    return response;
  }

  const response = new NextResponse(null, { status: 200 });
  setCorsHeaders(response, origin, config);
  return response;
}

function handleActualRequest(): NextResponse | null {
  // For actual requests, we don't return a response here
  // The CORS headers will be added to the actual response by the API route
  return null;
}

export function setCorsHeaders(
  response: NextResponse,
  origin: string | null,
  config: CorsConfig
): void {
  if (isOriginAllowed(origin, config.origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin!);
  } else if (config.origin === true) {
    response.headers.set("Access-Control-Allow-Origin", "*");
  } else if (Array.isArray(config.origin) && config.origin.length > 0) {
    response.headers.set("Access-Control-Allow-Origin", config.origin[0]);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    config.methods.join(", ")
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    config.allowedHeaders.join(", ")
  );

  if (config.credentials) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  if (config.maxAge) {
    response.headers.set("Access-Control-Max-Age", config.maxAge.toString());
  }

  response.headers.set(
    "Access-Control-Expose-Headers",
    "X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset"
  );
}

function isOriginAllowed(
  origin: string | null,
  allowedOrigins: string | string[] | boolean
): boolean {
  if (!origin) return false;

  if (allowedOrigins === true) return true;
  if (allowedOrigins === false) return false;

  if (typeof allowedOrigins === "string") {
    return origin === allowedOrigins;
  }

  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.includes(origin);
  }

  return false;
}

// Pre-configured CORS middleware for different environments
export const corsMiddleware = createCorsMiddleware();

// Development CORS (more permissive)
export const devCorsMiddleware = createCorsMiddleware({
  origin: true, // Allow all origins in development
  credentials: false, // Disable credentials for development
});

// Production CORS (strict)
export const prodCorsMiddleware = createCorsMiddleware({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || [
    "https://participation-app.vercel.app",
  ],
  credentials: true,
  maxAge: 3600, // 1 hour
});

export function applyCorsHeaders(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const origin = request.headers.get("origin");
  setCorsHeaders(response, origin, defaultCorsConfig);
  return response;
}
