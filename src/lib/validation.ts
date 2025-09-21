import { validate, ValidationError } from "class-validator";
import { plainToClass } from "class-transformer";

export interface ValidationResult<T = Record<string, unknown>> {
  isValid: boolean;
  errors: string[];
  data?: T;
}

export async function validateDto<T>(
  dtoClass: new () => T,
  data: Record<string, unknown>
): Promise<ValidationResult<T>> {
  try {
    const dto = plainToClass(dtoClass, data);
    const validationErrors = await validate(dto as Record<string, unknown>);

    if (validationErrors.length === 0) {
      return {
        isValid: true,
        errors: [],
        data: dto,
      };
    }

    const errors: string[] = [];
    validationErrors.forEach((error: ValidationError) => {
      if (error.constraints) {
        Object.values(error.constraints).forEach((message) => {
          errors.push(message);
        });
      }
    });

    return {
      isValid: false,
      errors,
    };
  } catch {
    return {
      isValid: false,
      errors: ["Invalid data format"],
    };
  }
}
