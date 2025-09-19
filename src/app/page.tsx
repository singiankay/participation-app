"use client";

import { useState, Suspense } from "react";
import ParticipantsList from "./components/ParticipantsList";
import Loading from "./loading";

export default function Home() {
  const [showAddForm, setShowAddForm] = useState(true);

  const handleAddParticipant = (participant: {
    firstName: string;
    lastName: string;
    participation: number;
  }) => {
    // TODO: Implement API call to add participant
    console.log("Adding participant:", participant);
    // Reset form
    setShowAddForm(false);
    setTimeout(() => setShowAddForm(true), 100);
  };

  const handleDelete = (id: string) => {
    // TODO: Implement API call to delete participant
    console.log("Deleting participant:", id);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setTimeout(() => setShowAddForm(true), 100);
  };

  return (
    <Suspense fallback={<Loading />}>
      <ParticipantsList
        onAddParticipant={handleAddParticipant}
        onDelete={handleDelete}
        onCancelAdd={handleCancelAdd}
        showAddForm={showAddForm}
      />
    </Suspense>
  );
}
