"use client";

import { usePathname } from "next/navigation";

import { NotFoundContent } from "@/components/layout/NotFoundContent";

/** Rendered inside the site layout, so the header and footer stay available. */
export default function LocaleNotFound() {
  const lang = usePathname()?.split("/")[1] === "ar" ? "ar" : "en";
  return <NotFoundContent lang={lang} />;
}
