"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ParticipationForm from "./components/ParticipationForm";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  participation: number;
}

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showAddForm, setShowAddForm] = useState(true);

  useEffect(() => {
    // TODO: Implement API call to fetch participants
    // Mock data for now
    const mockParticipants: Participant[] = [
      { id: "1", firstName: "John", lastName: "Doe", participation: 75.5 },
      { id: "2", firstName: "Jane", lastName: "Smith", participation: 82.3 },
      { id: "3", firstName: "Bob", lastName: "Johnson", participation: 68.7 },
    ];
    setParticipants(mockParticipants);
  }, []);

  const handleAddParticipant = (participant: {
    firstName: string;
    lastName: string;
    participation: number;
  }) => {
    // TODO: Implement API call to add participant
    console.log("Adding participant:", participant);

    // For now, add to local state
    const newParticipant: Participant = {
      id: Date.now().toString(),
      ...participant,
    };
    setParticipants((prev) => [...prev, newParticipant]);

    // Reset form
    setShowAddForm(false);
    setTimeout(() => setShowAddForm(true), 100);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement API call to delete participant
    console.log("Deleting participant:", id);
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setTimeout(() => setShowAddForm(true), 100);
  };

  if (showAddForm) {
    return (
      <ParticipationForm
        mode="add"
        participants={participants}
        onSave={handleAddParticipant}
        onCancel={handleCancelAdd}
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
            onClick={() => setShowAddForm(true)}
            className="submit-button"
          >
            ADD PARTICIPANT
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="content-main">
        {/* Centered title and description */}
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
                            onClick={() => handleDelete(participant.id)}
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
