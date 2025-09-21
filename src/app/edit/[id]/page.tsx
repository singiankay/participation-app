"use client";

import { useRouter } from "next/navigation";
import { useParticipants } from "../../context/ParticipantsContext";
import ParticipationForm from "../../components/ParticipationForm";
import { useEffect, useState, use } from "react";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  participation: number;
}

export default function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { updateParticipant } = useParticipants();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap the params Promise
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchParticipant = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/participants/${resolvedParams.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch participant data");
        }

        const participantData = await response.json();
        setParticipant(participantData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchParticipant();
  }, [resolvedParams.id]);

  const handleSave = async (updatedParticipant: {
    firstName: string;
    lastName: string;
    participation: number;
  }) => {
    const success = await updateParticipant(
      resolvedParams.id,
      updatedParticipant
    );
    if (success) {
      // Only redirect on successful update
      router.push("/");
    }
    // If not successful, stay on the page to show the error
  };

  const handleCancel = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <header className="header-main">
        <div className="form-container">
          <div className="text-white text-center">Loading...</div>
        </div>
      </header>
    );
  }

  if (error || !participant) {
    return (
      <header className="header-main">
        <div className="form-container">
          <div className="text-white text-center">
            <h1 className="form-title">Participant not found</h1>
            <p className="text-white mb-4">
              {error || "The participant you're looking for doesn't exist."}
            </p>
            <button onClick={handleCancel} className="submit-button">
              Go Back
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="header-main">
      <ParticipationForm
        mode="edit"
        participant={participant}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </header>
  );
}
