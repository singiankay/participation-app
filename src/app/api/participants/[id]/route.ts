import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateParticipantDto } from "@/dto/UpdateParticipantDto";
import { validateDto } from "@/lib/validation";
import {
  validateParticipationTotal,
  validateNameUniqueness,
} from "@/lib/participationValidation";

// GET /api/participants/[id] - Get a specific participant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const participant = await prisma.participant.findUnique({
      where: {
        id: resolvedParams.id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    // Transform the data to match the frontend interface
    const transformedParticipant = {
      id: participant.id,
      firstName: participant.firstname,
      lastName: participant.lastname,
      participation: participant.participation,
    };

    return NextResponse.json(transformedParticipant);
  } catch (error) {
    console.error("Error fetching participant:", error);
    return NextResponse.json(
      { error: "Failed to fetch participant" },
      { status: 500 }
    );
  }
}

// PUT /api/participants/[id] - Update a specific participant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();

    const validation = await validateDto(UpdateParticipantDto, body);

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

    // Validate name uniqueness (excluding current participant)
    const uniquenessValidation = await validateNameUniqueness(
      validatedData.firstName,
      validatedData.lastName,
      resolvedParams.id
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
      validatedData.participation,
      resolvedParams.id
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

    const participant = await prisma.participant.update({
      where: {
        id: resolvedParams.id,
      },
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

    return NextResponse.json(transformedParticipant);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    console.error("Error updating participant:", error);
    return NextResponse.json(
      { error: "Failed to update participant" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await prisma.participant.delete({
      where: {
        id: resolvedParams.id,
      },
    });

    return NextResponse.json({ message: "Participant deleted successfully" });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting participant:", error);
    return NextResponse.json(
      { error: "Failed to delete participant" },
      { status: 500 }
    );
  }
}
