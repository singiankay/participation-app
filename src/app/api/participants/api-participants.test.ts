import { NextRequest } from "next/server";
import { GET, POST } from "./route";
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
      findMany: jest.fn(),
      create: jest.fn(),
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

describe("/api/participants", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/participants", () => {
    it("should return all participants", async () => {
      const mockParticipants = [
        {
          id: "1",
          firstname: "John",
          lastname: "Doe",
          participation: 50,
          createdAt: new Date("2023-01-01"),
        },
        {
          id: "2",
          firstname: "Jane",
          lastname: "Smith",
          participation: 30,
          createdAt: new Date("2023-01-02"),
        },
      ];

      (mockPrisma.participant.findMany as jest.Mock).mockResolvedValue(
        mockParticipants
      );

      const mockRequest = new NextRequest(
        "http://localhost:3000/api/participants"
      );
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([
        {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          participation: 50,
        },
        {
          id: "2",
          firstName: "Jane",
          lastName: "Smith",
          participation: 30,
        },
      ]);
      expect(mockPrisma.participant.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: "desc",
        },
      });
    });

    it("should return empty array when no participants exist", async () => {
      (mockPrisma.participant.findMany as jest.Mock).mockResolvedValue([]);

      const mockRequest = new NextRequest(
        "http://localhost:3000/api/participants"
      );
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it("should handle database errors", async () => {
      (mockPrisma.participant.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const mockRequest = new NextRequest(
        "http://localhost:3000/api/participants"
      );
      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Failed to fetch participants",
      });
    });
  });

  describe("POST /api/participants", () => {
    const validRequestData = {
      firstName: "John",
      lastName: "Doe",
      participation: 50,
    };

    const mockCreatedParticipant = {
      id: "1",
      firstname: "John",
      lastname: "Doe",
      participation: 50,
      createdAt: new Date("2023-01-01"),
      updatedAt: new Date("2023-01-01"),
    };

    it("should create a new participant with valid data", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants",
        {
          method: "POST",
          body: JSON.stringify(validRequestData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      mockValidateDto.mockResolvedValue({
        isValid: true,
        errors: [],
        data: validRequestData,
      });

      mockValidateNameUniqueness.mockResolvedValue({
        isValid: true,
      });

      mockValidateParticipationTotal.mockResolvedValue({
        isValid: true,
        currentTotal: 0,
        newTotal: 50,
      });

      (mockPrisma.participant.create as jest.Mock).mockResolvedValue(
        mockCreatedParticipant
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({
        id: "1",
        firstName: "John",
        lastName: "Doe",
        participation: 50,
      });

      expect(mockValidateDto).toHaveBeenCalled();
      expect(mockValidateNameUniqueness).toHaveBeenCalledWith("John", "Doe");
      expect(mockValidateParticipationTotal).toHaveBeenCalledWith(50);
      expect(mockPrisma.participant.create).toHaveBeenCalledWith({
        data: {
          firstname: "John",
          lastname: "Doe",
          participation: 50,
        },
      });
    });

    it("should return validation errors for invalid data", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants",
        {
          method: "POST",
          body: JSON.stringify(validRequestData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      mockValidateDto.mockResolvedValue({
        isValid: false,
        errors: ["First name is required", "Participation must be a number"],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "Validation failed",
        details: ["First name is required", "Participation must be a number"],
      });
    });

    it("should return error for duplicate names", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants",
        {
          method: "POST",
          body: JSON.stringify(validRequestData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      mockValidateDto.mockResolvedValue({
        isValid: true,
        errors: [],
        data: validRequestData,
      });

      mockValidateNameUniqueness.mockResolvedValue({
        isValid: false,
        error: "A participant with this name already exists",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "Validation failed",
        details: ["A participant with this name already exists"],
      });
    });

    it("should return error when participation total exceeds 100%", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants",
        {
          method: "POST",
          body: JSON.stringify(validRequestData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      mockValidateDto.mockResolvedValue({
        isValid: true,
        errors: [],
        data: validRequestData,
      });

      mockValidateNameUniqueness.mockResolvedValue({
        isValid: true,
      });

      mockValidateParticipationTotal.mockResolvedValue({
        isValid: false,
        currentTotal: 80,
        newTotal: 130,
        error: "Total participation cannot exceed 100%",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: "Participation validation failed",
        details: ["Total participation cannot exceed 100%"],
      });
    });

    it("should handle database errors during creation", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants",
        {
          method: "POST",
          body: JSON.stringify(validRequestData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      mockValidateDto.mockResolvedValue({
        isValid: true,
        errors: [],
        data: validRequestData,
      });

      mockValidateNameUniqueness.mockResolvedValue({
        isValid: true,
      });

      mockValidateParticipationTotal.mockResolvedValue({
        isValid: true,
        currentTotal: 0,
        newTotal: 50,
      });

      // @ts-expect-error: intentional
      mockPrisma.participant.create.mockRejectedValue(
        new Error("Database error")
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Failed to create participant",
      });
    });

    it("should handle malformed JSON in request body", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/participants",
        {
          method: "POST",
          body: "invalid json",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: "Failed to create participant",
      });
    });
  });
});
