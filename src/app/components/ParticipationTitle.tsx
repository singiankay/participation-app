"use client";

import { useParticipants } from "../context/ParticipantsContext";

export default function ParticipationTitle() {
  const { participants } = useParticipants();

  const totalParticipation =
    participants?.reduce((sum, p) => sum + p.participation, 0) || 0;

  return (
    <div className="title-section">
      <h1 className="main-title">Participation Tracker</h1>
      <p className="main-description">
        Manage and track participation percentages for team members. Add new
        participants and view the distribution in real-time.
      </p>

      {/* Total Participation Indicator */}
      {participants && participants.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Total Participation</h3>
            <span className="text-2xl font-bold text-[#00b8e2]">
              {totalParticipation}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-[#00b8e2] h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(totalParticipation, 100)}%` }}
            ></div>
          </div>

          {totalParticipation < 100 && (
            <p className="text-sm text-amber-600 mt-2">
              {100 - totalParticipation}% remaining to reach full participation
            </p>
          )}
        </div>
      )}
    </div>
  );
}
