"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ParticipationForm from "./ParticipationForm";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  participation: number;
}

interface ParticipantsListProps {
  onAddParticipant: (participant: {
    firstName: string;
    lastName: string;
    participation: number;
  }) => void;
  onDelete: (id: string) => void;
  onCancelAdd: () => void;
  showAddForm: boolean;
}

// Create a promise that we can throw to suspend
let participantsPromise: Promise<Participant[]> | null = null;

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
      }, 1000);
    });
  }
  return participantsPromise;
}

// Custom hook that suspends
function useParticipants() {
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [promise, setPromise] = useState<Promise<Participant[]> | null>(null);

  useEffect(() => {
    const currentPromise = getParticipantsPromise();
    setPromise(currentPromise);

    currentPromise
      .then((data) => {
        setParticipants(data);
        setPromise(null);
      })
      .catch((err) => {
        setError(err);
        setPromise(null);
      });
  }, []);

  if (error) throw error;
  if (promise) throw promise; // This will suspend with the actual running promise

  return participants;
}

export default function ParticipantsList({
  onAddParticipant,
  onDelete,
  onCancelAdd,
  showAddForm,
}: ParticipantsListProps) {
  const participants = useParticipants();

  if (showAddForm) {
    return (
      <ParticipationForm
        mode="add"
        participants={participants ?? []}
        onSave={onAddParticipant}
        onCancel={onCancelAdd}
      />
    );
  }

  return (
    <div className="main-container">
      {/* Header */}
      <header className="header-main">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-white text-2xl font-bold">
            Participation Management
          </h1>
          <button
            onClick={() => window.location.reload()}
            className="submit-button"
          >
            ADD PARTICIPANT
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="content-main">
        <div className="title-section">
          <h1 className="main-title">PARTICIPANTS</h1>
          <p className="main-description">
            Manage and track participation percentages for team members. Add new
            participants and view the distribution in real-time.
          </p>
        </div>

        {/* Content area */}
        <div className="content-grid">
          {/* Left side - Participants Table */}
          <div className="card-base">
            <h2 className="card-title">Participation Table</h2>
            <div className="table-container">
              <table className="table-base">
                <thead>
                  <tr className="table-header">
                    <th className="table-header-cell">Name</th>
                    <th className="table-header-cell">Participation</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(participants ?? []).map((participant) => (
                    <tr key={participant.id} className="table-row">
                      <td className="table-cell">
                        {participant.firstName} {participant.lastName}
                      </td>
                      <td className="table-cell">
                        {participant.participation}%
                      </td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          <Link
                            href={`/edit/${participant.id}`}
                            className="action-link"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => onDelete(participant.id)}
                            className="action-delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right side - Chart placeholder */}
          <div className="card-base">
            <h2 className="card-title">Participation Chart</h2>
          </div>
        </div>
      </main>
    </div>
  );
}
