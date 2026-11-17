"use client";

import { useEffect } from "react";

import { ErrorContent } from "@/components/layout/ErrorContent";
import "./globals.css";

/** Last-resort boundary for errors in the root layout itself. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const lang = typeof window !== "undefined" && window.location.pathname.split("/")[1] === "ar" ? "ar" : "en";
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);
  return (
    <html lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <body className="bg-apex-bg text-apex-text">
        <ErrorContent lang={lang} reset={reset} />
      </body>
    </html>
  );
}
