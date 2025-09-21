import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
    const { firstName, lastName, participation } = body;

    if (!firstName || !lastName || participation === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const participant = await prisma.participant.create({
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

    return NextResponse.json(transformedParticipant, { status: 201 });
  } catch (error) {
    console.error("Error creating participant:", error);
    return NextResponse.json(
      { error: "Failed to create participant" },
      { status: 500 }
    );
  }
}
