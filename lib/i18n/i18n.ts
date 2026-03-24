// file: lib/i18n.ts

import "server-only";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assertStringAtPath(
  root: unknown,
  path: readonly string[],
  locale: Locale
): void {
  let current: unknown = root;

  for (const segment of path) {
    if (!isRecord(current) || !(segment in current)) {
      throw new Error(
        `Invalid dictionary (${locale}): missing "${path.join(".")}"`
      );
    }
    current = current[segment];
  }

  if (typeof current !== "string") {
    throw new Error(
      `Invalid dictionary (${locale}): "${path.join(".")}" must be a string`
    );
  }
}

function assertDictionary(value: unknown, locale: Locale): asserts value is Dictionary {
  const requiredStringPaths: Array<readonly string[]> = [
    ["navigation", "home"],
    ["navigation", "portfolio"],
    ["navigation", "academy"],
    ["navigation", "blog"],
    ["navigation", "letsTalk"],
    ["heroSection", "headline"],
    ["heroSection", "highlight"],
    ["heroSection", "subheadline"],
    ["heroSection", "cta"],
    ["about", "title"],
    ["about", "subtitle"],
    ["about", "cards", "innovation", "title"],
    ["about", "cards", "innovation", "text"],
    ["about", "cards", "quality", "title"],
    ["about", "cards", "quality", "text"],
    ["about", "cards", "partnership", "title"],
    ["about", "cards", "partnership", "text"],
    ["services", "title"],
    ["services", "subtitle"],
    ["contact", "title"],
    ["contact", "description"],
    ["contact", "email"],
    ["contact", "whatsapp"],
  ];

  for (const path of requiredStringPaths) {
    assertStringAtPath(value, path, locale);
  }
}

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  ar: () => import("@/dictionaries/ar.json").then((m) => m.default),
} satisfies Record<Locale, () => Promise<unknown>>;

export async function getDictionary(
  locale: Locale
): Promise<Dictionary> {
  const rawDictionary = await dictionaries[locale]();
  assertDictionary(rawDictionary, locale);
  return rawDictionary;
}
