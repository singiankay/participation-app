"use client";

import { useState } from "react";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  participation: number;
}

interface ParticipationFormProps {
  mode: "add" | "edit";
  participant?: Participant;
  participants?: Participant[];
  onSave: (participant: Omit<Participant, "id">) => void;
  onCancel: () => void;
}

export default function ParticipationForm({
  mode,
  participant,
  participants = [],
  onSave,
  onCancel,
}: ParticipationFormProps) {
  const [formData, setFormData] = useState({
    firstName: participant?.firstName || "",
    lastName: participant?.lastName || "",
    participation: participant?.participation?.toString() || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      firstName: formData.firstName,
      lastName: formData.lastName,
      participation: parseFloat(formData.participation) || 0,
    });
  };

  return (
    <div className="main-container">
      <header className="header-main">
        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-fields-container">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="form-field"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="form-field"
            />
            <input
              type="number"
              name="participation"
              placeholder="Participation"
              value={formData.participation}
              onChange={handleInputChange}
              required
              min="0"
              max="100"
              step="0.01"
              className="form-field"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="submit-button">
              {mode === "add" ? "SEND" : "UPDATE"}
            </button>
            {mode === "edit" && (
              <button
                type="button"
                onClick={onCancel}
                className="cancel-button"
              >
                CANCEL
              </button>
            )}
          </div>
        </form>
      </header>

      <main className="content-main">
        <div className="title-section">
          <h1 className="main-title">
            {mode === "add"
              ? "ADD PARTICIPANT"
              : `EDITING ${participant?.firstName} ${participant?.lastName}`}
          </h1>
          <p className="main-description">
            {mode === "add"
              ? "Add a new participant to the participation management system."
              : "Update the participation details for this participant."}
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
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p.id} className="table-row">
                      <td className="table-cell">
                        {p.firstName} {p.lastName}
                      </td>
                      <td className="table-cell">{p.participation}%</td>
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
