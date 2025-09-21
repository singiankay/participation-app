"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useParticipants } from "../context/ParticipantsContext";
import ParticipationForm from "./ParticipationForm";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  participation: number;
}

// Custom hook that fetches specific participant data
function useParticipantData() {
  const { participants } = useParticipants();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(window.location.search);
        const id =
          params.get("id") || window.location.pathname.split("/").pop() || "1";

        const response = await fetch(`/api/participants/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch participant data");
        }

        const participantData = await response.json();
        setParticipant(participantData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipant();
  }, []);

  if (error) throw error;
  if (loading) {
    // Return a promise to suspend
    throw new Promise(() => {});
  }

  return { participants, participant };
}

export default function EditParticipant() {
  const router = useRouter();
  const { participant } = useParticipantData();
  const { updateParticipant } = useParticipants();

  const handleSave = async (updatedParticipant: {
    firstName: string;
    lastName: string;
    participation: number;
  }) => {
    try {
      await updateParticipant(participant?.id || "", updatedParticipant);
      // Redirect to home after successful update
      router.push("/");
    } catch (error) {
      console.error("Error updating participant:", error);
      // You might want to show an error message to the user here
    }
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
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
