"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            background: "#f8f9fa",
            color: "#1b1b1b",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>⚠️</div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
              Something went wrong
            </h1>
            <p style={{ marginBottom: "32px", color: "#555" }}>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "12px 32px",
                borderRadius: "999px",
                fontWeight: 700,
                fontSize: "14px",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                background: "linear-gradient(135deg, #3f51b5, #1e88e5)",
                boxShadow: "0 8px 28px rgba(63,81,181,0.38)",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
