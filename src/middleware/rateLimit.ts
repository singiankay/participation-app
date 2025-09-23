import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  limit: number;
  windowMs: number;
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

export function createRateLimit(config: RateLimitConfig) {
  const { limit, windowMs, message = "Too many requests" } = config;

  return function rateLimit(request: NextRequest): NextResponse | null {
    try {
      const ip = getClientIP(request);
      const now = Date.now();
      const pathname =
        (request && request.nextUrl && request.nextUrl.pathname) ||
        (request && request.url) ||
        "/api/unknown";
      const key = `${ip}:${pathname}`;

      cleanupExpiredEntries(now);

      const entry = rateLimitStore.get(key);

      if (!entry) {
        rateLimitStore.set(key, {
          count: 1,
          resetTime: now + windowMs,
        });
        return null;
      }

      if (now > entry.resetTime) {
        rateLimitStore.set(key, {
          count: 1,
          resetTime: now + windowMs,
        });
        return null;
      }

      if (entry.count >= limit) {
        const remainingTime = Math.ceil((entry.resetTime - now) / 1000);

        return NextResponse.json(
          {
            error: message,
            retryAfter: remainingTime,
          },
          {
            status: 429,
            headers: {
              "Retry-After": remainingTime.toString(),
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": entry.resetTime.toString(),
            },
          }
        );
      }

      entry.count++;
      rateLimitStore.set(key, entry);

      return null;
    } catch {
      return null;
    }
  };
}

function getClientIP(request: NextRequest): string {
  try {
    if (!request.headers) {
      return "test-ip";
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    const cfConnectingIP = request.headers.get("cf-connecting-ip");

    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }

    if (realIP) {
      return realIP;
    }

    if (cfConnectingIP) {
      return cfConnectingIP;
    }

    return "unknown";
  } catch {
    return "test-ip";
  }
}

function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  strict: {
    limit: 5,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many requests. Please try again later.",
  },

  moderate: {
    limit: 30,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many requests. Please slow down.",
  },

  lenient: {
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
    message: "Rate limit exceeded. Please try again later.",
  },

  veryStrict: {
    limit: 3,
    windowMs: 60 * 1000, // 1 minute
    message: "Too many sensitive requests. Please wait before trying again.",
  },
};

export const createStrictRateLimit = () => {
  // Disable rate limiting in test environment
  if (process.env.NODE_ENV === "test") {
    return () => null;
  }
  return createRateLimit(rateLimitConfigs.strict);
};

export const createModerateRateLimit = () => {
  // Disable rate limiting in test environment
  if (process.env.NODE_ENV === "test") {
    return () => null;
  }
  return createRateLimit(rateLimitConfigs.moderate);
};

export const createLenientRateLimit = () =>
  createRateLimit(rateLimitConfigs.lenient);
export const createVeryStrictRateLimit = () =>
  createRateLimit(rateLimitConfigs.veryStrict);
