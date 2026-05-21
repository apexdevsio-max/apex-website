"use client";

import { useEffect } from "react";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Locale error:", error);
  }, [error]);

  return (
    <div
      className="min-h-[60vh] flex items-center justify-center px-6"
      style={{ background: "var(--color-background)" }}
    >
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6" aria-hidden="true">⚠️</div>
        <h1
          className="text-2xl font-bold mb-3"
          style={{ color: "var(--color-primary-text)" }}
        >
          Something went wrong
        </h1>
        <p className="mb-8" style={{ color: "var(--color-secondary-text)" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="apex-btn apex-btn-primary px-8 py-3 rounded-full font-bold text-sm text-white cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
