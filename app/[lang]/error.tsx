"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { ErrorContent } from "@/components/layout/ErrorContent";

export default function LocaleError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const lang = usePathname()?.split("/")[1] === "ar" ? "ar" : "en";
  useEffect(() => {
    console.error("Locale error:", error);
  }, [error]);
  return <ErrorContent lang={lang} reset={reset} />;
}
