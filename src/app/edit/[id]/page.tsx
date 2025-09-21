"use client";

import ParticipationForm from "@/app/components/ParticipationForm";

export default function EditPage() {
  return (
    <header className="header-main">
      <ParticipationForm mode="edit" onSave={() => {}} onCancel={() => {}} />
    </header>
  );
}
