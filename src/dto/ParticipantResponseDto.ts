import { Expose } from "class-transformer";

export class ParticipantResponseDto {
  @Expose()
  id!: string;

  @Expose()
  firstName!: string;

  @Expose()
  lastName!: string;

  @Expose()
  participation!: number;
}
