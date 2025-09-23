import { validateDto } from "./validation";
import { CreateParticipantDto } from "@/dto/CreateParticipantDto";
import { UpdateParticipantDto } from "@/dto/UpdateParticipantDto";

describe("validateDto", () => {
  describe("with CreateParticipantDto", () => {
    it("should validate valid data", async () => {
      const validData = {
        firstName: "John",
        lastName: "Doe",
        participation: 50,
      };

      const result = await validateDto(CreateParticipantDto, validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.data).toBeDefined();
      expect(result.data).toMatchObject(validData);
    });

    it("should reject invalid firstName", async () => {
      const invalidData = {
        firstName: "J", // Too short
        lastName: "Doe",
        participation: 50,
      };

      const result = await validateDto(CreateParticipantDto, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "First name must be at least 2 characters long"
      );
    });

    it("should reject invalid lastName", async () => {
      const invalidData = {
        firstName: "John",
        lastName: "D", // Too short
        participation: 50,
      };

      const result = await validateDto(CreateParticipantDto, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "Last name must be at least 2 characters long"
      );
    });

    it("should reject invalid participation", async () => {
      const invalidData = {
        firstName: "John",
        lastName: "Doe",
        participation: 150, // Too high
      };

      const result = await validateDto(CreateParticipantDto, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Participation cannot exceed 100%");
    });

    it("should reject names with numbers", async () => {
      const invalidData = {
        firstName: "John123",
        lastName: "Doe456",
        participation: 50,
      };

      const result = await validateDto(CreateParticipantDto, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "First name can only contain letters and spaces"
      );
      expect(result.errors).toContain(
        "Last name can only contain letters and spaces"
      );
    });

    it("should reject missing required fields", async () => {
      const invalidData = {
        firstName: "John",
        // Missing lastName and participation
      };

      const result = await validateDto(CreateParticipantDto, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Last name is required");
      expect(result.errors).toContain("Participation must be a number");
    });

    it("should reject empty strings", async () => {
      const invalidData = {
        firstName: "",
        lastName: "",
        participation: 50,
      };

      const result = await validateDto(CreateParticipantDto, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("First name is required");
      expect(result.errors).toContain("Last name is required");
    });

    it("should reject non-string names", async () => {
      const invalidData = {
        firstName: 123,
        lastName: 456,
        participation: 50,
      };

      const result = await validateDto(CreateParticipantDto, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("First name must be a string");
      expect(result.errors).toContain("Last name must be a string");
    });

    it("should reject non-number participation", async () => {
      const invalidData = {
        firstName: "John",
        lastName: "Doe",
        participation: "fifty",
      };

      const result = await validateDto(CreateParticipantDto, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Participation must be a number");
    });

    it("should accept names with spaces", async () => {
      const validData = {
        firstName: "John Michael",
        lastName: "Van Der Berg",
        participation: 50,
      };

      const result = await validateDto(CreateParticipantDto, validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should accept edge case participation values", async () => {
      const testCases = [
        { participation: 0 },
        { participation: 100 },
        { participation: 50.5 },
      ];

      for (const testCase of testCases) {
        const data = {
          firstName: "John",
          lastName: "Doe",
          participation: testCase.participation,
        };

        const result = await validateDto(CreateParticipantDto, data);
        expect(result.isValid).toBe(true);
      }
    });
  });

  describe("with UpdateParticipantDto", () => {
    it("should validate valid data", async () => {
      const validData = {
        firstName: "Jane",
        lastName: "Smith",
        participation: 75,
      };

      const result = await validateDto(UpdateParticipantDto, validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.data).toBeDefined();
    });

    it("should reject names longer than 32 characters", async () => {
      const invalidData = {
        firstName: "A".repeat(33), // Too long for UpdateParticipantDto
        lastName: "Smith",
        participation: 75,
      };

      const result = await validateDto(UpdateParticipantDto, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        "First name must be less than 32 characters"
      );
    });
  });

  describe("error handling", () => {
    it("should handle invalid data format gracefully", async () => {
      // @ts-expect-error intentional
      const result = await validateDto(CreateParticipantDto, null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid data format");
    });

    it("should handle undefined data", async () => {
      // @ts-expect-error intentional
      const result = await validateDto(CreateParticipantDto, undefined);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid data format");
    });

    it("should handle malformed data", async () => {
      const malformedData = {
        firstName: "John",
        lastName: "Doe",
        participation: "not-a-number",
      };

      const result = await validateDto(CreateParticipantDto, malformedData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Participation must be a number");
    });
  });

  describe("multiple validation errors", () => {
    it("should return all validation errors", async () => {
      const invalidData = {
        firstName: "J", // Too short
        lastName: "D", // Too short
        participation: 150, // Too high
      };

      const result = await validateDto(CreateParticipantDto, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain(
        "First name must be at least 2 characters long"
      );
      expect(result.errors).toContain(
        "Last name must be at least 2 characters long"
      );
      expect(result.errors).toContain("Participation cannot exceed 100%");
    });
  });
});
