"use client";

import { useParticipants } from "../context/ParticipantsContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Recharts default color palette
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF7300",
];

export default function ParticipationChart() {
  const { participants, loading, error } = useParticipants();

  if (error) {
    return (
      <div>
        <div className="p-4 text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  // Prepare data for pie chart
  const totalParticipation =
    participants?.reduce((sum, p) => sum + p.participation, 0) || 0;

  const chartData =
    participants?.map((participant) => ({
      name: `${participant.firstName} ${participant.lastName}`,
      value: participant.participation,
    })) || [];

  // Add remaining percentage to show incomplete participation
  if (totalParticipation < 100) {
    chartData.push({
      name: "Remaining",
      value: 100 - totalParticipation,
    });
  }

  // Custom tooltip
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-blue-600">Participation: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {loading && (
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          <span className="ml-2 text-sm text-gray-500">(Loading...)</span>
        </h2>
      )}

      <div className="space-y-6">
        {/* Pie Chart */}
        {chartData.length > 0 && (
          <div className="flex items-center gap-8">
            <div className="h-100 w-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => {
                      const isRemaining = entry.name === "Remaining";
                      const color = isRemaining
                        ? "#E5E7EB"
                        : COLORS[index % COLORS.length];

                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <div className="space-y-4">
                {chartData.map((entry, index) => {
                  const isRemaining = entry.name === "Remaining";
                  const color = isRemaining
                    ? "#E5E7EB"
                    : COLORS[index % COLORS.length];
                  const textColor = isRemaining
                    ? "text-gray-400"
                    : "text-gray-500";

                  return (
                    <div
                      key={`legend-${index}`}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="w-5 h-5 rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1">
                        <span className={`text-md font-medium ${textColor}`}>
                          {entry.name}
                        </span>
                        <span className={`text-sm ml-2 ${textColor}`}>
                          ({entry.value}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {chartData.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">
            No participants data available
          </div>
        )}
      </div>
    </div>
  );
}
