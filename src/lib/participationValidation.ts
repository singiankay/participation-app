import { prisma } from "@/lib/db";

export interface ParticipationValidationResult {
  isValid: boolean;
  currentTotal: number;
  newTotal: number;
  error?: string;
}

export interface UniquenessValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateParticipationTotal(
  newParticipation: number,
  excludeParticipantId?: string
): Promise<ParticipationValidationResult> {
  try {
    const participants = await prisma.participant.findMany({
      where: excludeParticipantId
        ? {
            id: {
              not: excludeParticipantId,
            },
          }
        : {},
      select: {
        participation: true,
      },
    });

    const currentTotal = participants.reduce(
      (sum, participant) => sum + participant.participation,
      0
    );

    const newTotal = currentTotal + newParticipation;

    if (newTotal > 100) {
      return {
        isValid: false,
        currentTotal,
        newTotal,
        error: `Total participation would be ${newTotal}%, which exceeds 100%. Current total is ${currentTotal}%, so the maximum allowed participation is ${
          100 - currentTotal
        }%.`,
      };
    }

    return {
      isValid: true,
      currentTotal,
      newTotal,
    };
  } catch (error) {
    console.error("Error validating participation total:", error);
    return {
      isValid: false,
      currentTotal: 0,
      newTotal: 0,
      error: "Failed to validate participation total",
    };
  }
}

export async function validateNameUniqueness(
  firstName: string,
  lastName: string,
  excludeParticipantId?: string
): Promise<UniquenessValidationResult> {
  try {
    // Check if a participant with the same first and last name already exists
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        firstname: firstName,
        lastname: lastName,
        ...(excludeParticipantId && {
          id: {
            not: excludeParticipantId,
          },
        }),
      },
    });

    if (existingParticipant) {
      return {
        isValid: false,
        error: `A participant with the name "${firstName} ${lastName}" already exists.`,
      };
    }

    return {
      isValid: true,
    };
  } catch (error) {
    console.error("Error validating name uniqueness:", error);
    return {
      isValid: false,
      error: "Failed to validate name uniqueness",
    };
  }
}
