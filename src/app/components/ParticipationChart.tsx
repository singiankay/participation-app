"use client";

import { useParticipants } from "../context/ParticipantsContext";

export default function ParticipationChart() {
  const { participants, loading, error } = useParticipants();

  if (error) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Participation Chart
        </h2>
        <div className="p-4 text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  const totalParticipation =
    participants?.reduce((sum, p) => sum + p.participation, 0) || 0;
  const averageParticipation = participants?.length
    ? totalParticipation / participants.length
    : 0;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Participation Chart
        {loading && (
          <span className="ml-2 text-sm text-gray-500">(Refreshing...)</span>
        )}
      </h2>
      <div>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Statistics</h3>
            <p>Total Participants: {participants?.length || 0}</p>
            <p>Average Participation: {averageParticipation.toFixed(1)}%</p>
            <p>Total Participation: {totalParticipation}%</p>
          </div>

          {participants && participants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Participation Distribution
              </h3>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center space-x-2"
                  >
                    <div className="w-24 text-sm">
                      {participant.firstName} {participant.lastName}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(participant.participation, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="w-12 text-sm text-right">
                      {participant.participation}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
