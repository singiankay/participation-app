import { NextRequest } from "next/server";
import { createCorsMiddleware, corsMiddleware } from "@/middleware/cors";

describe("CORS Middleware", () => {
  const mockRequest = (origin: string = "http://localhost:3000") => {
    return new NextRequest("http://localhost:3000/api/participants", {
      headers: {
        origin,
      },
    });
  };

  describe("createCorsMiddleware", () => {
    it("should return null for non-OPTIONS requests", () => {
      const cors = createCorsMiddleware();
      const request = mockRequest();

      const response = cors(request);

      expect(response).toBeNull();
    });

    it("should handle OPTIONS requests", () => {
      const cors = createCorsMiddleware();
      const request = new NextRequest(
        "http://localhost:3000/api/participants",
        {
          method: "OPTIONS",
          headers: {
            origin: "http://localhost:3000",
          },
        }
      );

      const response = cors(request);

      expect(response).not.toBeNull();
      expect(response?.status).toBe(200);
    });
  });

  describe("Default CORS middleware", () => {
    it("should handle OPTIONS requests", () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants",
        {
          method: "OPTIONS",
          headers: {
            origin: "http://localhost:3000",
          },
        }
      );

      const response = corsMiddleware(request);

      expect(response).not.toBeNull();
      expect(response?.status).toBe(200);
    });

    it("should return null for non-OPTIONS requests", () => {
      const request = mockRequest();

      const response = corsMiddleware(request);

      expect(response).toBeNull();
    });
  });
});
