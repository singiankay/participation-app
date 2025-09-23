import { validate } from "class-validator";
import { CreateParticipantDto } from "./CreateParticipantDto";

describe("CreateParticipantDto", () => {
  let dto: CreateParticipantDto;

  beforeEach(() => {
    dto = new CreateParticipantDto();
  });

  describe("Valid data", () => {
    it("should pass validation with valid data", async () => {
      dto.firstName = "John";
      dto.lastName = "Doe";
      dto.participation = 50;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should pass validation with minimum valid data", async () => {
      dto.firstName = "Jo";
      dto.lastName = "Do";
      dto.participation = 0;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("should pass validation with maximum valid data", async () => {
      dto.firstName = "A".repeat(50);
      dto.lastName = "B".repeat(50);
      dto.participation = 100;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe("firstName validation", () => {
    it("should fail validation when firstName is empty", async () => {
      dto.firstName = "";
      dto.lastName = "Doe";
      dto.participation = 50;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe("firstName");
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it("should fail validation when firstName is too short", async () => {
      dto.firstName = "J";
      dto.lastName = "Doe";
      dto.participation = 50;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe("firstName");
      expect(errors[0].constraints?.minLength).toBeDefined();
    });

    it("should fail validation when firstName is too long", async () => {
      dto.firstName = "A".repeat(51);
      dto.lastName = "Doe";
      dto.participation = 50;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe("firstName");
      expect(errors[0].constraints?.maxLength).toBeDefined();
    });

    it("should fail validation when firstName contains numbers", async () => {
      dto.firstName = "John123";
      dto.lastName = "Doe";
      dto.participation = 50;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe("firstName");
      expect(errors[0].constraints?.matches).toBeDefined();
    });

    it("should pass validation when firstName contains spaces", async () => {
      dto.firstName = "John Paul";
      dto.lastName = "Doe";
      dto.participation = 50;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe("lastName validation", () => {
    it("should fail validation when lastName is empty", async () => {
      dto.firstName = "John";
      dto.lastName = "";
      dto.participation = 50;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe("lastName");
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it("should fail validation when lastName is too short", async () => {
      dto.firstName = "John";
      dto.lastName = "D";
      dto.participation = 50;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe("lastName");
      expect(errors[0].constraints?.minLength).toBeDefined();
    });

    it("should fail validation when lastName is too long", async () => {
      dto.firstName = "John";
      dto.lastName = "A".repeat(51);
      dto.participation = 50;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe("lastName");
      expect(errors[0].constraints?.maxLength).toBeDefined();
    });

    it("should fail validation when lastName contains numbers", async () => {
      dto.firstName = "John";
      dto.lastName = "Doe123";
      dto.participation = 50;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe("lastName");
      expect(errors[0].constraints?.matches).toBeDefined();
    });
  });

  describe("participation validation", () => {
    it("should fail validation when participation is negative", async () => {
      dto.firstName = "John";
      dto.lastName = "Doe";
      dto.participation = -1;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe("participation");
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it("should fail validation when participation exceeds 100", async () => {
      dto.firstName = "John";
      dto.lastName = "Doe";
      dto.participation = 101;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe("participation");
      expect(errors[0].constraints?.max).toBeDefined();
    });

    it("should fail validation when participation is not a number", async () => {
      dto.firstName = "John";
      dto.lastName = "Doe";
      dto.participation = "not a number" as unknown as number;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe("participation");
      expect(errors[0].constraints?.isNumber).toBeDefined();
    });

    it("should pass validation with decimal participation", async () => {
      dto.firstName = "John";
      dto.lastName = "Doe";
      dto.participation = 50.5;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe("Multiple validation errors", () => {
    it("should return multiple errors for invalid data", async () => {
      dto.firstName = "";
      dto.lastName = "";
      dto.participation = -1;

      const errors = await validate(dto);
      expect(errors).toHaveLength(3);
      expect(errors.map((e) => e.property)).toContain("firstName");
      expect(errors.map((e) => e.property)).toContain("lastName");
      expect(errors.map((e) => e.property)).toContain("participation");
    });
  });
});
