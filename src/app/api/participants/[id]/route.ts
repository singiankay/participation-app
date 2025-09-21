import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/participants/[id] - Get a specific participant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const participant = await prisma.participant.findUnique({
      where: {
        id: params.id,
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { firstName, lastName, participation } = body;

    if (!firstName || !lastName || participation === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const participant = await prisma.participant.update({
      where: {
        id: params.id,
      },
      data: {
        firstname: firstName,
        lastname: lastName,
        participation: participation,
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
  { params }: { params: { id: string } }
) {
  try {
    await prisma.participant.delete({
      where: {
        id: params.id,
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
