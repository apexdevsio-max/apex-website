import { type Locale } from "@/lib/i18n/locale";

export interface RtlClasses {
  fontClass: string;
  textAlign: string;
  flexRev: string;
  arrowRotate: string;
  gradientDir: string;
  dirAttr: "rtl" | "ltr";
}

export function useRtl(lang: Locale): RtlClasses {
  const isAr = lang === "ar";
  return {
    fontClass: isAr ? "font-ar" : "font-en",
    textAlign: isAr ? "text-right" : "text-left",
    flexRev: isAr ? "flex-row-reverse" : "",
    arrowRotate: isAr ? "rotate-180" : "",
    gradientDir: isAr ? "to left" : "to right",
    dirAttr: isAr ? "rtl" : "ltr" as const,
  };
}

