"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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
  addParticipant: (participant: Omit<Participant, "id">) => Promise<void>;
  updateParticipant: (
    id: string,
    participant: Omit<Participant, "id">
  ) => Promise<void>;
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

  const addParticipant = async (participant: Omit<Participant, "id">) => {
    try {
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(participant),
      });

      if (!response.ok) {
        throw new Error("Failed to add participant");
      }

      const newParticipant = await response.json();
      setParticipants((prev) =>
        prev ? [...prev, newParticipant] : [newParticipant]
      );
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateParticipant = async (
    id: string,
    participant: Omit<Participant, "id">
  ) => {
    try {
      const response = await fetch(`/api/participants/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(participant),
      });

      if (!response.ok) {
        throw new Error("Failed to update participant");
      }

      const updatedParticipant = await response.json();
      setParticipants((prev) =>
        prev ? prev.map((p) => (p.id === id ? updatedParticipant : p)) : null
      );
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteParticipant = async (id: string) => {
    try {
      const response = await fetch(`/api/participants/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete participant");
      }

      setParticipants((prev) =>
        prev ? prev.filter((p) => p.id !== id) : null
      );
    } catch (err) {
      setError(err as Error);
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
