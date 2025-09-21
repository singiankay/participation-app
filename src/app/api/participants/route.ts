import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateParticipantDto } from "@/dto/CreateParticipantDto";
import { validateDto } from "@/lib/validation";
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

    // Transform the data to match the frontend interface
    const transformedParticipants = participants.map((participant) => ({
      id: participant.id,
      firstName: participant.firstname,
      lastName: participant.lastname,
      participation: participant.participation,
    }));

    return NextResponse.json(transformedParticipants);
  } catch (error) {
    console.error("Error fetching participants:", error);
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

    // Validate the request data
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

    // Validate name uniqueness
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

    // Validate that total participation doesn't exceed 100%
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

    // Transform the response to match the frontend interface
    const transformedParticipant = {
      id: participant.id,
      firstName: participant.firstname,
      lastName: participant.lastname,
      participation: participant.participation,
    };

    return NextResponse.json(transformedParticipant, { status: 201 });
  } catch (error) {
    console.error("Error creating participant:", error);
    return NextResponse.json(
      { error: "Failed to create participant" },
      { status: 500 }
    );
  }
}
