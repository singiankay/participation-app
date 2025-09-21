"use client";

import { useParticipants } from "../context/ParticipantsContext";
import ParticipationTitle from "./ParticipationTitle";
import ParticipationTable from "./ParticipationTable";
import ParticipationChart from "./ParticipationChart";
import Loading from "../loading";

interface LayoutProps {
  children: React.ReactNode;
}

export default function SuspenseLayout({ children }: LayoutProps) {
  const { participants, initialLoading } = useParticipants();

  if (initialLoading || !participants) {
    return <Loading />;
  }

  return (
    <div className="main-container">
      {children}
      <main className="content-main">
        <ParticipationTitle />
        <div className="content-grid">
          <ParticipationTable />
          <ParticipationChart />
        </div>
      </main>
    </div>
  );
}
