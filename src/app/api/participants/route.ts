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
import {
  createModerateRateLimit,
  createStrictRateLimit,
} from "@/middleware/rateLimit";
import { corsMiddleware, applyCorsHeaders } from "@/middleware/cors";

const getRateLimit = createModerateRateLimit();
const postRateLimit = createStrictRateLimit();

// GET /api/participants - Get all participants
export async function GET(request: NextRequest) {
  const corsResponse = corsMiddleware(request);
  if (corsResponse) {
    return corsResponse;
  }

  const rateLimitResponse = getRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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

    const response = NextResponse.json(transformedParticipants);

    response.headers.set("X-RateLimit-Limit", "30");
    response.headers.set("X-RateLimit-Remaining", "29");
    response.headers.set(
      "X-RateLimit-Reset",
      new Date(Date.now() + 60000).toISOString()
    );

    // Apply CORS headers
    return applyCorsHeaders(response, request);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch participants" },
      { status: 500 }
    );
  }
}

// POST /api/participants - Create a new participant
export async function POST(request: NextRequest) {
  const corsResponse = corsMiddleware(request);
  if (corsResponse) {
    return corsResponse;
  }

  const rateLimitResponse = postRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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

    const response = NextResponse.json(transformedParticipant, { status: 201 });

    response.headers.set("X-RateLimit-Limit", "5");
    response.headers.set("X-RateLimit-Remaining", "4");
    response.headers.set(
      "X-RateLimit-Reset",
      new Date(Date.now() + 60000).toISOString()
    );

    // Apply CORS headers
    return applyCorsHeaders(response, request);
  } catch {
    return NextResponse.json(
      { error: "Failed to create participant" },
      { status: 500 }
    );
  }
}
