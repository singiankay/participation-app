"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import toast from "react-hot-toast";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  participation: number;
}

interface ParticipantsContextType {
  participants: Participant[] | null;
  loading: boolean;
  initialLoading: boolean;
  error: Error | null;
  refreshParticipants: () => Promise<void>;
  addParticipant: (participant: Omit<Participant, "id">) => Promise<boolean>;
  updateParticipant: (
    id: string,
    participant: Omit<Participant, "id">
  ) => Promise<boolean>;
  deleteParticipant: (id: string) => Promise<void>;
}

const ParticipantsContext = createContext<ParticipantsContextType | undefined>(
  undefined
);

export function ParticipantsProvider({ children }: { children: ReactNode }) {
  const [participants, setParticipants] = useState<Participant[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchParticipants = async (isInitial = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/participants");
      console.log(`fetching participants`, response);

      if (!response.ok) {
        throw new Error("Failed to fetch participants");
      }

      const data = await response.json();
      setParticipants(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
      if (isInitial) {
        setInitialLoading(false);
      }
    }
  };

  const addParticipant = async (
    participant: Omit<Participant, "id">
  ): Promise<boolean> => {
    try {
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(participant),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessage = errorData.details.join(", ");
          toast.error(errorMessage);
          return false; // Return false for validation errors
        }
        toast.error(errorData.error || "Failed to add participant");
        return false; // Return false for other errors
      }

      const newParticipant = await response.json();
      setParticipants((prev) =>
        prev ? [...prev, newParticipant] : [newParticipant]
      );
      toast.success(
        `${participant.firstName} ${participant.lastName} added successfully!`
      );
      return true; // Return true for success
    } catch (err) {
      console.error("Error adding participant:", err);
      toast.error("Failed to add participant. Please try again.");
      return false; // Return false for exceptions
    }
  };

  const updateParticipant = async (
    id: string,
    participant: Omit<Participant, "id">
  ): Promise<boolean> => {
    try {
      const response = await fetch(`/api/participants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(participant),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.details && Array.isArray(errorData.details)) {
          // Server-side validation errors
          const errorMessage = errorData.details.join(", ");
          toast.error(errorMessage);
          return false; // Return false for validation errors
        }
        toast.error(errorData.error || "Failed to update participant");
        return false; // Return false for other errors
      }

      const updatedParticipant = await response.json();
      setParticipants((prev) =>
        prev ? prev.map((p) => (p.id === id ? updatedParticipant : p)) : null
      );
      toast.success(
        `${participant.firstName} ${participant.lastName} updated successfully!`
      );
      return true; // Return true for success
    } catch (err) {
      console.error("Error updating participant:", err);
      toast.error("Failed to update participant. Please try again.");
      return false; // Return false for exceptions
    }
  };

  const deleteParticipant = async (id: string) => {
    try {
      const participantToDelete = participants?.find((p) => p.id === id);
      const participantName = participantToDelete
        ? `${participantToDelete.firstName} ${participantToDelete.lastName}`
        : "Participant";

      const response = await fetch(`/api/participants/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete participant");
      }

      setParticipants((prev) =>
        prev ? prev.filter((p) => p.id !== id) : null
      );
      toast.success(`${participantName} deleted successfully!`);
    } catch (err) {
      console.error("Error deleting participant:", err);
      toast.error("Failed to delete participant. Please try again.");
      throw err;
    }
  };

  useEffect(() => {
    fetchParticipants(true); // Mark as initial load
  }, []);

  const value: ParticipantsContextType = {
    participants,
    loading,
    initialLoading,
    error,
    refreshParticipants: () => fetchParticipants(false), // Not initial load
    addParticipant,
    updateParticipant,
    deleteParticipant,
  };

  return (
    <ParticipantsContext.Provider value={value}>
      {children}
    </ParticipantsContext.Provider>
  );
}

export function useParticipants() {
  const context = useContext(ParticipantsContext);
  if (context === undefined) {
    throw new Error(
      "useParticipants must be used within a ParticipantsProvider"
    );
  }
  return context;
}
