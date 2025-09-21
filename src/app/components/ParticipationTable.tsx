"use client";

import { useState, useEffect } from "react";
import { useParticipants } from "../context/ParticipantsContext";
import Link from "next/link";

export default function ParticipationTable() {
  const { participants, error, deleteParticipant } = useParticipants();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState("");
  const itemsPerPage = 2; // Number of participants per page

  // Filter participants
  const filteredParticipants =
    participants?.filter((participant) => {
      if (searchFilter === "") return true;

      const searchTerm = searchFilter.toLowerCase();
      const firstName = participant.firstName.toLowerCase();
      const lastName = participant.lastName.toLowerCase();
      const participation = participant.participation.toString();

      return (
        firstName.includes(searchTerm) ||
        lastName.includes(searchTerm) ||
        participation.includes(searchTerm)
      );
    }) || [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParticipants = filteredParticipants.slice(startIndex, endIndex);

  // Reset to page 1 when participants or search filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [participants?.length, searchFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (error) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Participation Table
        </h2>
        <div className="p-4 text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 p-4 rounded-lg">
        <div>
          <label
            htmlFor="searchFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Filter
          </label>
          <input
            id="searchFilter"
            type="text"
            placeholder="Search by name or participation %..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-40 max-w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {searchFilter && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {filteredParticipants.length} of{" "}
              {participants?.length || 0} participants
            </span>
            <button
              onClick={() => setSearchFilter("")}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                First Name
              </th>
              <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                Last Name
              </th>
              <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                Participation
              </th>
              <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentParticipants.map((participant) => (
              <tr key={participant.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {participant.firstName}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {participant.lastName}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                  {participant.participation}%
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div className="flex space-x-2">
                    <Link
                      href={`/edit/${participant.id}`}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteParticipant(participant.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(endIndex, filteredParticipants.length)} of{" "}
            {filteredParticipants.length} participants
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 text-sm border rounded ${
                      currentPage === page
                        ? "bg-blue-500 text-white border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
