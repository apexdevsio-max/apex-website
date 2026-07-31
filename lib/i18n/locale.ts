export const SUPPORTED_LOCALES = ["en", "ar"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/**
 * The locale used whenever one cannot be determined from the URL or headers.
 * Must stay in sync with the `x-default` hreflang target in lib/seo/metadata.ts —
 * announcing one default to search engines while serving another splits ranking
 * signals between the two language versions.
 */
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Narrows an untrusted route segment to a locale, falling back to the default. */
export function toLocale(value: string | undefined): Locale {
  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}
