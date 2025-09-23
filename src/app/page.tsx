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
    await addParticipant(participant);
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
