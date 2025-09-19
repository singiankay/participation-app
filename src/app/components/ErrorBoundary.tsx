"use client";

import { useEffect } from "react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
  redirectPath?: string;
  redirectDelay?: number;
}

export default function ErrorBoundary({
  error,
  reset,
  title = "Something went wrong!",
  message = "We encountered an unexpected error. Please try again.",
  showRetry = true,
  redirectPath = "/",
  redirectDelay = 5000,
}: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);

    // Auto-redirect after delay
    const timer = setTimeout(() => {
      window.location.href = redirectPath;
    }, redirectDelay);

    return () => clearTimeout(timer);
  }, [error, redirectPath, redirectDelay]);

  const handleRetry = () => {
    reset();
  };

  const handleGoHome = () => {
    window.location.href = redirectPath;
  };

  return (
    <div className="min-h-screen bg-[#00b8e2] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {title}
          </h1>
          <p className="text-lg text-white mb-6">{message}</p>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 p-4 bg-white bg-opacity-20 rounded-lg text-left">
              <summary className="cursor-pointer font-medium text-white mb-2">
                Error Details
              </summary>
              <pre className="text-xs text-white overflow-auto">
                {error.message}
                {error.stack && `\n\nStack trace:\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showRetry && (
            <button
              onClick={handleRetry}
              className="submit-button flex items-center justify-center"
            >
              Try Again
            </button>
          )}
          <button onClick={handleGoHome} className="cancel-button">
            Go Home
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-white opacity-90">
            You will be automatically redirected in {redirectDelay / 1000}{" "}
            seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
