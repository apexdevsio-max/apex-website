import type { Locale } from "@/lib/i18n/locale";

/**
 * Locale-aware formatting. Dates used to print as raw ISO strings and Arabic
 * reading time always said "دقائق", which is wrong for 11 minutes and up.
 * Arabic uses Western digits here, matching the article bodies.
 */
export function formatDate(iso: string | undefined, lang: Locale): string {
  if (!iso) return "";
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-u-nu-latn" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

const AR_MINUTES = new Intl.PluralRules("ar");

export function readTimeLabel(minutes: number, lang: Locale): string {
  if (lang === "en") return `${minutes} min read`;
  switch (AR_MINUTES.select(minutes)) {
    case "one":
      return "دقيقة قراءة واحدة";
    case "two":
      return "دقيقتا قراءة";
    case "few":
      return `${minutes} دقائق قراءة`;
    default:
      return `${minutes} دقيقة قراءة`;
  }
}
