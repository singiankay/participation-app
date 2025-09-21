"use client";

import { useState, useEffect } from "react";
import { useParticipants } from "../context/ParticipantsContext";
import Link from "next/link";
import DeleteModal from "./DeleteModal";

export default function ParticipationTable() {
  const { participants, loading, error, deleteParticipant } = useParticipants();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilter, setSearchFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(2); // Number of participants per page
  const [sortField, setSortField] = useState<
    "firstName" | "lastName" | "participation"
  >("firstName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Filter and sort participants
  const filteredParticipants =
    participants
      ?.filter((participant) => {
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
      })
      ?.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case "firstName":
            aValue = a.firstName.toLowerCase();
            bValue = b.firstName.toLowerCase();
            break;
          case "lastName":
            aValue = a.lastName.toLowerCase();
            bValue = b.lastName.toLowerCase();
            break;
          case "participation":
            aValue = a.participation;
            bValue = b.participation;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      }) || [];

  // Calculate pagination
  const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParticipants = filteredParticipants.slice(startIndex, endIndex);

  // Reset to page 1 when participants, search filter, itemsPerPage, or sorting changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    participants?.length,
    searchFilter,
    itemsPerPage,
    sortField,
    sortDirection,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (field: "firstName" | "lastName" | "participation") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDeleteClick = (participant: {
    id: string;
    firstName: string;
    lastName: string;
  }) => {
    setParticipantToDelete({
      id: participant.id,
      name: `${participant.firstName} ${participant.lastName}`,
    });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (participantToDelete) {
      await deleteParticipant(participantToDelete.id);
      setIsDeleteModalOpen(false);
      setParticipantToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setParticipantToDelete(null);
  };

  if (error) {
    return (
      <div>
        <div className="p-4 text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {loading && (
            <span className="ml-2 text-sm text-gray-500">(Loading...)</span>
          )}
        </h2>
        <div>
          <input
            id="searchFilter"
            type="text"
            placeholder="Filter"
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
              <th className="w-16 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b" />
              <th
                className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-300 select-none"
                onClick={() => handleSort("firstName")}
              >
                <div className="flex items-center gap-1">
                  First Name
                  {sortField === "firstName" && (
                    <span className="text-[#00b8e2]">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-300 select-none"
                onClick={() => handleSort("lastName")}
              >
                <div className="flex items-center gap-1">
                  Last Name
                  {sortField === "lastName" && (
                    <span className="text-[#00b8e2]">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b cursor-pointer hover:bg-gray-300 select-none"
                onClick={() => handleSort("participation")}
              >
                <div className="flex items-center gap-1">
                  Participation
                  {sortField === "participation" && (
                    <span className="text-[#00b8e2]">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentParticipants.map((participant, index) => (
              <tr key={participant.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                  {startIndex + index + 1}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                  {participant.firstName}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                  {participant.lastName}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {participant.participation}%
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <Link
                      href={`/edit/${participant.id}`}
                      className="action-edit"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(participant)}
                      className="text-red-600 hover:text-red-900 font-medium cursor-pointer"
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

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to{" "}
          {Math.min(endIndex, filteredParticipants.length)} of{" "}
          {filteredParticipants.length} participants
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
              Show:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="dropdown-show"
            >
              <option className="dropdown-show-option" value={2}>
                2
              </option>
              <option className="dropdown-show-option" value={5}>
                5
              </option>
              <option className="dropdown-show-option" value={10}>
                10
              </option>
            </select>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center space-x-2 text-gray-400">
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
                          ? "btn-pagination-active"
                          : "btn-pagination-inactive"
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
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        participantName={participantToDelete?.name || ""}
      />
    </div>
  );
}
