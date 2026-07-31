import { type Locale } from "@/lib/i18n/locale";

export interface RtlClasses {
  fontClass: string;
  textAlign: string;
  flexRev: string;
  arrowRotate: string;
  gradientDir: string;
  dirAttr: "rtl" | "ltr";
}

/**
 * Pure helper, deliberately not named `use*`: it holds no state and is called from
 * server components (Footer), where a real hook would be invalid. Naming it as a
 * hook would also subject it to rules-of-hooks lint it has no reason to follow.
 */
export function getRtlClasses(lang: Locale): RtlClasses {
  const isAr = lang === "ar";
  return {
    fontClass: isAr ? "font-ar" : "font-en",
    textAlign: isAr ? "text-right" : "text-left",
    flexRev: isAr ? "flex-row-reverse" : "",
    arrowRotate: isAr ? "rotate-180" : "",
    gradientDir: isAr ? "to left" : "to right",
    dirAttr: isAr ? "rtl" : "ltr",
  };
}
