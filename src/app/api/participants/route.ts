import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateParticipantDto } from "@/dto/CreateParticipantDto";
import { ParticipantResponseDto } from "@/dto/ParticipantResponseDto";
import { validateDto } from "@/lib/validation";
import { plainToClass } from "class-transformer";
import {
  validateParticipationTotal,
  validateNameUniqueness,
} from "@/lib/participationValidation";

// GET /api/participants - Get all participants
export async function GET() {
  try {
    const participants = await prisma.participant.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedParticipants = participants.map((participant) =>
      plainToClass(ParticipantResponseDto, {
        id: participant.id,
        firstName: participant.firstname,
        lastName: participant.lastname,
        participation: participant.participation,
      })
    );

    return NextResponse.json(transformedParticipants);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}

// POST /api/participants - Create a new participant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = await validateDto(CreateParticipantDto, body);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const validatedData = validation.data!;
    const uniquenessValidation = await validateNameUniqueness(
      validatedData.firstName,
      validatedData.lastName
    );

    if (!uniquenessValidation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: [uniquenessValidation.error!],
        },
        { status: 400 }
      );
    }

    const participationValidation = await validateParticipationTotal(
      validatedData.participation
    );

    if (!participationValidation.isValid) {
      return NextResponse.json(
        {
          error: "Participation validation failed",
          details: [participationValidation.error!],
        },
        { status: 400 }
      );
    }

    const participant = await prisma.participant.create({
      data: {
        ...(({ firstName, lastName, participation }) => ({
          firstname: firstName,
          lastname: lastName,
          participation,
        }))(validatedData),
      },
    });

    const transformedParticipant = plainToClass(ParticipantResponseDto, {
      id: participant.id,
      firstName: participant.firstname,
      lastName: participant.lastname,
      participation: participant.participation,
    });

    return NextResponse.json(transformedParticipant, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create participant" },
      { status: 500 }
    );
  }
}
