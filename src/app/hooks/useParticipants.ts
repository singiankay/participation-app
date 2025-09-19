import { useState, useEffect } from "react";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  participation: number;
}

// Simulate an async data fetch that can be suspended
let participantsPromise: Promise<Participant[]> | null = null;

function fetchParticipants(): Promise<Participant[]> {
  if (!participantsPromise) {
    participantsPromise = new Promise((resolve) => {
      setTimeout(() => {
        const mockParticipants: Participant[] = [
          { id: "1", firstName: "John", lastName: "Doe", participation: 75.5 },
          {
            id: "2",
            firstName: "Jane",
            lastName: "Smith",
            participation: 82.3,
          },
          {
            id: "3",
            firstName: "Bob",
            lastName: "Johnson",
            participation: 68.7,
          },
        ];
        resolve(mockParticipants);
      }, 1000);
    });
  }
  return participantsPromise;
}

// Hook that suspends until data is loaded
export function useParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchParticipants().then((data) => {
      setParticipants(data);
      setIsLoading(false);
    });
  }, []);

  return { participants, isLoading };
}

// Function to get participants data (for Suspense)
export function getParticipants(): Promise<Participant[]> {
  return fetchParticipants();
}
