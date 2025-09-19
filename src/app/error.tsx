"use client";

import ErrorBoundary from "@/app/components/ErrorBoundary";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      title="Something went wrong!"
      message="We encountered an unexpected error. Please try again."
      showRetry={true}
      redirectPath="/"
      redirectDelay={5000}
    />
  );
}
