"use client";

import { useState, useEffect } from "react";
import ParticipationForm from "./ParticipationForm";
import { getParticipants } from "../hooks/useParticipants";
import Link from "next/link";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  participation: number;
}

interface AsyncParticipantsListProps {
  onAddParticipant: (participant: {
    firstName: string;
    lastName: string;
    participation: number;
  }) => void;
  onDelete: (id: string) => void;
  onCancelAdd: () => void;
  showAddForm: boolean;
}

// This component will suspend until data is loaded
async function ParticipantsData() {
  const participants = await getParticipants();
  return participants;
}

export default function AsyncParticipantsList({
  onAddParticipant,
  onDelete,
  onCancelAdd,
  showAddForm,
}: AsyncParticipantsListProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Fetch participants data on mount

  useEffect(() => {
    let isMounted = true;
    ParticipantsData().then((data) => {
      if (isMounted) {
        setParticipants(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (showAddForm) {
    return (
      <ParticipationForm
        mode="add"
        participants={participants}
        onSave={onAddParticipant}
        onCancel={onCancelAdd}
      />
    );
  }

  return (
    <div className="main-container">
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

      <main className="content-main">
        <div className="title-section">
          <h1 className="main-title">PARTICIPANTS</h1>
          <p className="main-description">
            Manage and track participation percentages for team members. Add new
            participants and view the distribution in real-time.
          </p>
        </div>

        <div className="content-grid">
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
                  {participants.map((participant) => (
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

          <div className="card-base">
            <h2 className="card-title">Participation Chart</h2>
          </div>
        </div>
      </main>
    </div>
  );
}
