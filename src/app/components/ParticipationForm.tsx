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
  onSave: (participant: Omit<Participant, "id">) => void;
  onCancel: () => void;
}

export default function ParticipationForm({
  mode,
  participant,
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
    <form onSubmit={handleSubmit} className="form-container">
      {mode === "edit" && participant && (
        <h1 className="form-title">
          Edit Participation - {participant.firstName} {participant.lastName}
        </h1>
      )}
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
        <button type="submit" className="submit-button">
          {mode === "add" ? "SEND" : "UPDATE"}
        </button>
        {mode === "edit" && (
          <button type="button" onClick={onCancel} className="cancel-button">
            CANCEL
          </button>
        )}
      </div>
    </form>
  );
}
