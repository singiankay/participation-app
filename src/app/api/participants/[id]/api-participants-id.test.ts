import { NextRequest } from "next/server";
import { GET, PUT, DELETE } from "./route";
import { prisma } from "@/lib/db";
import { validateDto } from "@/lib/validation";
import {
  validateParticipationTotal,
  validateNameUniqueness,
} from "@/lib/participationValidation";

// Mock dependencies
jest.mock("@/lib/db", () => ({
  prisma: {
    participant: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/validation", () => ({
  validateDto: jest.fn(),
}));

jest.mock("@/lib/participationValidation", () => ({
  validateParticipationTotal: jest.fn(),
  validateNameUniqueness: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockValidateDto = validateDto as jest.MockedFunction<typeof validateDto>;
const mockValidateParticipationTotal =
  validateParticipationTotal as jest.MockedFunction<
    typeof validateParticipationTotal
  >;
const mockValidateNameUniqueness =
  validateNameUniqueness as jest.MockedFunction<typeof validateNameUniqueness>;

describe("/api/participants/[id]", () => {
  const mockParams = { id: "participant-123" };
  const mockParticipant = {
    id: "participant-123",
    firstname: "John",
    lastname: "Doe",
    participation: 50,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/participants/[id]", () => {
    it("should return a specific participant", async () => {
      (mockPrisma.participant.findUnique as jest.Mock).mockResolvedValue(
        mockParticipant
      );

      const response = await GET(
        new NextRequest(
          "http://localhost:3000/api/participants/participant-123"
        ),
        {
          params: Promise.resolve(mockParams),
        }
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        id: "participant-123",
        firstName: "John",
        lastName: "Doe",
        participation: 50,
      });
      expect(mockPrisma.participant.findUnique).toHaveBeenCalledWith({
        where: {
          id: "participant-123",
        },
      });
    });

    it("should return 404 when participant not found", async () => {
      (mockPrisma.participant.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await GET(
        new NextRequest("http://localhost:3000/api/participants/nonexistent"),
        {
          params: Promise.resolve({ id: "nonexistent" }),
        }
      );
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "Participant not found",
      });
    });

    it("should handle database errors", async () => {
      (mockPrisma.participant.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await GET(
        new NextRequest(
          "http://localhost:3000/api/participants/participant-123"
        ),
        {
          params: Promise.resolve(mockParams),
        }
      );
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Failed to fetch participant",
      });
    });
  });

  describe("PUT /api/participants/[id]", () => {
    const validUpdateData = {
      firstName: "Jane",
      lastName: "Smith",
      participation: 75,
    };

    it("should update a participant with valid data", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants/participant-123",
        {
          method: "PUT",
          body: JSON.stringify(validUpdateData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const updatedParticipant = {
        ...mockParticipant,
        firstname: "Jane",
        lastname: "Smith",
        participation: 75,
      };

      mockValidateDto.mockResolvedValue({
        isValid: true,
        errors: [],
        data: validUpdateData,
      });

      mockValidateNameUniqueness.mockResolvedValue({
        isValid: true,
      });

      mockValidateParticipationTotal.mockResolvedValue({
        isValid: true,
        currentTotal: 0,
        newTotal: 75,
      });

      (mockPrisma.participant.update as jest.Mock).mockResolvedValue(
        updatedParticipant
      );

      const response = await PUT(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        id: "participant-123",
        firstName: "Jane",
        lastName: "Smith",
        participation: 75,
      });

      expect(mockValidateDto).toHaveBeenCalled();
      expect(mockValidateNameUniqueness).toHaveBeenCalledWith(
        "Jane",
        "Smith",
        "participant-123"
      );
      expect(mockValidateParticipationTotal).toHaveBeenCalledWith(
        75,
        "participant-123"
      );
      expect(mockPrisma.participant.update).toHaveBeenCalledWith({
        where: {
          id: "participant-123",
        },
        data: {
          firstname: "Jane",
          lastname: "Smith",
          participation: 75,
        },
      });
    });

    it("should return validation errors for invalid data", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants/participant-123",
        {
          method: "PUT",
          body: JSON.stringify(validUpdateData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      mockValidateDto.mockResolvedValue({
        isValid: false,
        errors: ["First name is required", "Participation must be a number"],
      });

      const response = await PUT(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "Validation failed",
        details: ["First name is required", "Participation must be a number"],
      });
    });

    it("should return error for duplicate names", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants/participant-123",
        {
          method: "PUT",
          body: JSON.stringify(validUpdateData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      mockValidateDto.mockResolvedValue({
        isValid: true,
        errors: [],
        data: validUpdateData,
      });

      mockValidateNameUniqueness.mockResolvedValue({
        isValid: false,
        error: "A participant with this name already exists",
      });

      const response = await PUT(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "Validation failed",
        details: ["A participant with this name already exists"],
      });
    });

    it("should return error when participation total exceeds 100%", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants/participant-123",
        {
          method: "PUT",
          body: JSON.stringify(validUpdateData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      mockValidateDto.mockResolvedValue({
        isValid: true,
        errors: [],
        data: validUpdateData,
      });

      mockValidateNameUniqueness.mockResolvedValue({
        isValid: true,
      });

      mockValidateParticipationTotal.mockResolvedValue({
        isValid: false,
        currentTotal: 80,
        newTotal: 155,
        error: "Total participation cannot exceed 100%",
      });

      const response = await PUT(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "Participation validation failed",
        details: ["Total participation cannot exceed 100%"],
      });
    });

    it("should return 404 when participant not found during update", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants/nonexistent",
        {
          method: "PUT",
          body: JSON.stringify(validUpdateData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      mockValidateDto.mockResolvedValue({
        isValid: true,
        errors: [],
        data: validUpdateData,
      });

      mockValidateNameUniqueness.mockResolvedValue({
        isValid: true,
      });

      mockValidateParticipationTotal.mockResolvedValue({
        isValid: true,
        currentTotal: 0,
        newTotal: 75,
      });

      const prismaError = {
        code: "P2025",
        message: "Record not found",
      };
      (mockPrisma.participant.update as jest.Mock).mockRejectedValue(
        prismaError
      );

      const response = await PUT(request, {
        params: Promise.resolve({ id: "nonexistent" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "Participant not found",
      });
    });

    it("should handle database errors during update", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants/participant-123",
        {
          method: "PUT",
          body: JSON.stringify(validUpdateData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      mockValidateDto.mockResolvedValue({
        isValid: true,
        errors: [],
        data: validUpdateData,
      });

      mockValidateNameUniqueness.mockResolvedValue({
        isValid: true,
      });

      mockValidateParticipationTotal.mockResolvedValue({
        isValid: true,
        currentTotal: 0,
        newTotal: 75,
      });

      (mockPrisma.participant.update as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await PUT(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Failed to update participant",
      });
    });

    it("should handle malformed JSON in request body", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants/participant-123",
        {
          method: "PUT",
          body: "invalid json",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await PUT(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Failed to update participant",
      });
    });
  });

  describe("DELETE /api/participants/[id]", () => {
    it("should delete a participant", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants/participant-123",
        {
          method: "DELETE",
        }
      );

      (mockPrisma.participant.delete as jest.Mock).mockResolvedValue(
        mockParticipant
      );

      const response = await DELETE(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        message: "Participant deleted successfully",
      });
      expect(mockPrisma.participant.delete).toHaveBeenCalledWith({
        where: {
          id: "participant-123",
        },
      });
    });

    it("should return 404 when participant not found during deletion", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants/nonexistent",
        {
          method: "DELETE",
        }
      );

      const prismaError = {
        code: "P2025",
        message: "Record not found",
      };
      (mockPrisma.participant.delete as jest.Mock).mockRejectedValue(
        prismaError
      );

      const response = await DELETE(request, {
        params: Promise.resolve({ id: "nonexistent" }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: "Participant not found",
      });
    });

    it("should handle database errors during deletion", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants/participant-123",
        {
          method: "DELETE",
        }
      );

      (mockPrisma.participant.delete as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const response = await DELETE(request, {
        params: Promise.resolve(mockParams),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Failed to delete participant",
      });
    });
  });
});
