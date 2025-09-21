"use client";

import { useRouter } from "next/navigation";
import { useParticipants } from "./context/ParticipantsContext";
import ParticipationForm from "./components/ParticipationForm";

export default function Home() {
  const router = useRouter();
  const { addParticipant } = useParticipants();

  const handleSave = async (participant: {
    firstName: string;
    lastName: string;
    participation: number;
  }) => {
    const success = await addParticipant(participant);
    if (success) {
      // Optionally redirect or show success message
      // The toast notification is already handled in the context
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <header className="header-main">
      <ParticipationForm
        mode="add"
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </header>
  );
}
