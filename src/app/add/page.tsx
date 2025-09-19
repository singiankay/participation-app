"use client";

import { useRouter } from "next/navigation";
import ParticipationForm from "../components/ParticipationForm";

export default function AddPage() {
  const router = useRouter();

  const handleSave = (participant: {
    firstName: string;
    lastName: string;
    participation: number;
  }) => {
    // TODO: Implement API call to save participant
    console.log("Adding participant:", participant);

    // For now, just redirect to home
    router.push("/");
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <ParticipationForm mode="add" onSave={handleSave} onCancel={handleCancel} />
  );
}
