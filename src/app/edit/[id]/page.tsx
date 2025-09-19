"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import ParticipationForm from "@/app/components/ParticipationForm";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  participation: number;
}

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implement API call to fetch participant by ID and all participants
    // For now, we'll simulate loading with mock data
    const mockParticipants: Participant[] = [
      { id: "1", firstName: "John", lastName: "Doe", participation: 75.5 },
      { id: "2", firstName: "Jane", lastName: "Smith", participation: 82.3 },
      { id: "3", firstName: "Bob", lastName: "Johnson", participation: 68.7 },
    ];

    const mockParticipant: Participant = {
      id: params.id as string,
      firstName: "John",
      lastName: "Doe",
      participation: 75.5,
    };

    setTimeout(() => {
      setParticipants(mockParticipants);
      setParticipant(mockParticipant);
      setLoading(false);
    }, 500);
  }, [params.id]);

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

  if (loading) {
    return (
      <div className="main-container">
        <div className="content-main">
          <div className="title-section">
            <h1 className="main-title">Loading...</h1>
          </div>
        </div>
      </div>
    );
  }

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
      participants={participants}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
