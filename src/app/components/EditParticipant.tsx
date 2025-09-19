"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ParticipationForm from "./ParticipationForm";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  participation: number;
}

// Create promises that we can throw to suspend
let participantsPromise: Promise<Participant[]> | null = null;
let participantPromise: Promise<Participant> | null = null;

function getParticipantsPromise(): Promise<Participant[]> {
  if (!participantsPromise) {
    participantsPromise = new Promise((resolve) => {
      setTimeout(() => {
        const mockParticipants: Participant[] = [
          { id: "1", firstName: "John", lastName: "Doe", participation: 75.5 },
          {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            participation: 82.3,
          },
          {
            id: "3",
            firstName: "Bob",
            lastName: "Johnson",
            participation: 68.7,
          },
        ];
        resolve(mockParticipants);
      }, 500);
    });
  }
  return participantsPromise;
}

function getParticipantPromise(id: string): Promise<Participant> {
  if (!participantPromise) {
    participantPromise = new Promise((resolve) => {
      setTimeout(() => {
        const mockParticipant: Participant = {
          id: id,
          firstName: "John",
          lastName: "Doe",
          participation: 75.5,
        };
        resolve(mockParticipant);
      }, 500);
    });
  }
  return participantPromise;
}

// Custom hook that suspends
function useParticipantData() {
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [promise, setPromise] = useState<Promise<
    [Participant[], Participant]
  > | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id =
      params.get("id") || window.location.pathname.split("/").pop() || "1";

    const currentPromise = Promise.all([
      getParticipantsPromise(),
      getParticipantPromise(id),
    ]);
    setPromise(currentPromise);

    currentPromise
      .then(([participantsData, participantData]) => {
        setParticipants(participantsData);
        setParticipant(participantData);
        setPromise(null);
      })
      .catch((err) => {
        setError(err);
        setPromise(null);
      });
  }, []);

  if (error) throw error;
  if (promise) throw promise; // This will suspend with the actual running promise

  return { participants, participant };
}

export default function EditParticipant() {
  const router = useRouter();
  const { participants, participant } = useParticipantData();

  const handleSave = (updatedParticipant: {
    firstName: string;
    lastName: string;
    participation: number;
  }) => {
    // TODO: Implement API call to update participant
    console.log("Updating participant:", updatedParticipant);

    // For now, just redirect to home
    router.push("/");
  };

  const handleCancel = () => {
    router.push("/");
  };

  if (!participant) {
    return (
      <div className="main-container">
        <div className="content-main">
          <div className="title-section">
            <h1 className="main-title">Participant not found</h1>
            <p className="main-description">
              The participant you&apos;re looking for doesn&apos;t exist.
            </p>
            <button
              onClick={() => router.push("/")}
              className="submit-button mt-4"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ParticipationForm
      mode="edit"
      participant={participant}
      participants={participants ?? undefined}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
