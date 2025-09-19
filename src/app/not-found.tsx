"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#00b8e2] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            404 - Page Not Found
          </h1>
          <p className="text-lg text-white mb-6">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="submit-button flex items-center justify-center"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="cancel-button"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
