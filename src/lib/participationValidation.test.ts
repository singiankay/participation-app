import {
  validateParticipationTotal,
  validateNameUniqueness,
} from "./participationValidation";
import { prisma } from "@/lib/db";

// Mock the prisma client
jest.mock("@/lib/db", () => ({
  prisma: {
    participant: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("participationValidation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateParticipationTotal", () => {
    it("should return valid when total participation is within limit", async () => {
      (mockPrisma.participant.findMany as jest.Mock).mockResolvedValue([
        { participation: 30 },
        { participation: 20 },
      ]);

      const result = await validateParticipationTotal(25);

      expect(result.isValid).toBe(true);
      expect(result.currentTotal).toBe(50);
      expect(result.newTotal).toBe(75);
      expect(result.error).toBeUndefined();
    });

    it("should return valid when total participation equals 100%", async () => {
      (mockPrisma.participant.findMany as jest.Mock).mockResolvedValue([
        { participation: 30 },
        { participation: 20 },
      ]);

      const result = await validateParticipationTotal(50);

      expect(result.isValid).toBe(true);
      expect(result.currentTotal).toBe(50);
      expect(result.newTotal).toBe(100);
    });

    it("should return invalid when total participation exceeds 100%", async () => {
      (mockPrisma.participant.findMany as jest.Mock).mockResolvedValue([
        { participation: 30 },
        { participation: 20 },
      ]);

      const result = await validateParticipationTotal(51);

      expect(result.isValid).toBe(false);
      expect(result.currentTotal).toBe(50);
      expect(result.newTotal).toBe(101);
      expect(result.error).toContain("Total participation would be 101%");
      expect(result.error).toContain("Current total is 50%");
      expect(result.error).toContain("maximum allowed participation is 50%");
    });

    it("should handle empty participants list", async () => {
      (mockPrisma.participant.findMany as jest.Mock).mockResolvedValue([]);

      const result = await validateParticipationTotal(100);

      expect(result.isValid).toBe(true);
      expect(result.currentTotal).toBe(0);
      expect(result.newTotal).toBe(100);
    });

    it("should exclude participant when excludeParticipantId is provided", async () => {
      (mockPrisma.participant.findMany as jest.Mock).mockResolvedValue([
        { participation: 30 },
      ]);

      const result = await validateParticipationTotal(25, "exclude-id");

      expect(mockPrisma.participant.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            not: "exclude-id",
          },
        },
        select: {
          participation: true,
        },
      });
      expect(result.isValid).toBe(true);
    });

    it("should handle database errors", async () => {
      (mockPrisma.participant.findMany as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await validateParticipationTotal(25);

      expect(result.isValid).toBe(false);
      expect(result.currentTotal).toBe(0);
      expect(result.newTotal).toBe(0);
      expect(result.error).toBe("Failed to validate participation total");
    });
  });

  describe("validateNameUniqueness", () => {
    it("should return valid when name is unique", async () => {
      (mockPrisma.participant.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await validateNameUniqueness("John", "Doe");

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockPrisma.participant.findFirst).toHaveBeenCalledWith({
        where: {
          firstname: "John",
          lastname: "Doe",
        },
      });
    });

    it("should return invalid when name already exists", async () => {
      (mockPrisma.participant.findFirst as jest.Mock).mockResolvedValue({
        id: "1",
        firstname: "John",
        lastname: "Doe",
        participation: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await validateNameUniqueness("John", "Doe");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'A participant with the name "John Doe" already exists.'
      );
    });

    it("should exclude participant when excludeParticipantId is provided", async () => {
      (mockPrisma.participant.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await validateNameUniqueness("John", "Doe", "exclude-id");

      expect(mockPrisma.participant.findFirst).toHaveBeenCalledWith({
        where: {
          firstname: "John",
          lastname: "Doe",
          id: {
            not: "exclude-id",
          },
        },
      });
      expect(result.isValid).toBe(true);
    });

    it("should handle case sensitivity", async () => {
      (mockPrisma.participant.findFirst as jest.Mock).mockResolvedValue({
        id: "1",
        firstname: "john",
        lastname: "doe",
        participation: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await validateNameUniqueness("John", "Doe");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        'A participant with the name "John Doe" already exists.'
      );
    });

    it("should handle database errors", async () => {
      (mockPrisma.participant.findFirst as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const result = await validateNameUniqueness("John", "Doe");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Failed to validate name uniqueness");
    });
  });
});
