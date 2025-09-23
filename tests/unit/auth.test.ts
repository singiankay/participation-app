import { NextRequest } from "next/server";
import { createAuthMiddleware, authMiddleware } from "@/middleware/auth";

describe("Auth Middleware", () => {
  const mockRequest = (apiKey?: string) => {
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
    }

    return new NextRequest("http://localhost:3000/api/participants", {
      headers,
    });
  };

  describe("createAuthMiddleware", () => {
    it("should allow requests in development when auth is disabled", () => {
      const auth = createAuthMiddleware({ requireAuth: false });
      const request = mockRequest();

      const response = auth(request);

      expect(response).toBeNull();
    });

    it("should require API key in production", () => {
      const auth = createAuthMiddleware({
        requireAuth: true,
        allowedKeys: ["test-key-123"],
      });
      const request = mockRequest();

      const response = auth(request);

      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });

    it("should allow valid API key", () => {
      const auth = createAuthMiddleware({
        requireAuth: true,
        allowedKeys: ["test-key-123"],
      });
      const request = mockRequest("test-key-123");

      const response = auth(request);

      expect(response).toBeNull();
    });

    it("should reject invalid API key", () => {
      const auth = createAuthMiddleware({
        requireAuth: true,
        allowedKeys: ["test-key-123"],
      });
      const request = mockRequest("invalid-key");

      const response = auth(request);

      expect(response).not.toBeNull();
      expect(response?.status).toBe(401);
    });

    it("should allow OPTIONS requests without API key", () => {
      const auth = createAuthMiddleware({
        requireAuth: true,
        allowedKeys: ["test-key-123"],
      });
      const request = new NextRequest(
        "http://localhost:3000/api/participants",
        {
          method: "OPTIONS",
        }
      );

      const response = auth(request);

      expect(response).toBeNull();
    });
  });

  describe("Default auth middleware", () => {
    it("should work with default configuration", () => {
      const request = mockRequest("valid-key");

      const response = authMiddleware(request);

      // In test environment, auth is disabled by default
      expect(response).toBeNull();
    });
  });
});
