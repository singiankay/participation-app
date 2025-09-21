import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsNumber,
  Min,
  Max,
} from "class-validator";

export class CreateParticipantDto {
  @IsString({ message: "First name must be a string" })
  @IsNotEmpty({ message: "First name is required" })
  @MinLength(2, { message: "First name must be at least 2 characters long" })
  @MaxLength(50, { message: "First name must be less than 50 characters" })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: "First name can only contain letters and spaces",
  })
  firstName!: string;

  @IsString({ message: "Last name must be a string" })
  @IsNotEmpty({ message: "Last name is required" })
  @MinLength(2, { message: "Last name must be at least 2 characters long" })
  @MaxLength(50, { message: "Last name must be less than 50 characters" })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: "Last name can only contain letters and spaces",
  })
  lastName!: string;

  @IsNumber({}, { message: "Participation must be a number" })
  @Min(0, { message: "Participation must be at least 0%" })
  @Max(100, { message: "Participation cannot exceed 100%" })
  participation!: number;
}
