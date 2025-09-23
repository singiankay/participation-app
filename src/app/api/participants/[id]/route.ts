import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateParticipantDto } from "@/dto/UpdateParticipantDto";
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
import { authMiddleware } from "@/middleware/auth";

const getRateLimit = createModerateRateLimit();
const putRateLimit = createStrictRateLimit();
const deleteRateLimit = createStrictRateLimit();

// GET /api/participants/[id] - Get a specific participant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const corsResponse = corsMiddleware(request);
  if (corsResponse) {
    return corsResponse;
  }

  const authResponse = authMiddleware(request);
  if (authResponse) {
    return authResponse;
  }

  const rateLimitResponse = getRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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

    const transformedParticipant = plainToClass(ParticipantResponseDto, {
      id: participant.id,
      firstName: participant.firstname,
      lastName: participant.lastname,
      participation: participant.participation,
    });

    const response = NextResponse.json(transformedParticipant);

    response.headers.set("X-RateLimit-Limit", "30");
    response.headers.set("X-RateLimit-Remaining", "29");
    response.headers.set(
      "X-RateLimit-Reset",
      new Date(Date.now() + 60000).toISOString()
    );

    return applyCorsHeaders(response, request);
  } catch {
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
  const corsResponse = corsMiddleware(request);
  if (corsResponse) {
    return corsResponse;
  }

  const authResponse = authMiddleware(request);
  if (authResponse) {
    return authResponse;
  }

  const rateLimitResponse = putRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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
    const transformedParticipant = plainToClass(ParticipantResponseDto, {
      id: participant.id,
      firstName: participant.firstname,
      lastName: participant.lastname,
      participation: participant.participation,
    });

    const response = NextResponse.json(transformedParticipant);

    response.headers.set("X-RateLimit-Limit", "5");
    response.headers.set("X-RateLimit-Remaining", "4");
    response.headers.set(
      "X-RateLimit-Reset",
      new Date(Date.now() + 60000).toISOString()
    );

    return applyCorsHeaders(response, request);
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
  const corsResponse = corsMiddleware(request);
  if (corsResponse) {
    return corsResponse;
  }

  const authResponse = authMiddleware(request);
  if (authResponse) {
    return authResponse;
  }

  const rateLimitResponse = deleteRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const resolvedParams = await params;
    await prisma.participant.delete({
      where: {
        id: resolvedParams.id,
      },
    });

    const response = NextResponse.json({
      message: "Participant deleted successfully",
    });

    response.headers.set("X-RateLimit-Limit", "5");
    response.headers.set("X-RateLimit-Remaining", "4");
    response.headers.set(
      "X-RateLimit-Reset",
      new Date(Date.now() + 60000).toISOString()
    );

    return applyCorsHeaders(response, request);
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
    return NextResponse.json(
      { error: "Failed to delete participant" },
      { status: 500 }
    );
  }
}
