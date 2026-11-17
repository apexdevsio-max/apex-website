import "server-only";
import { cache } from "react";

import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
  ar: () => import("@/dictionaries/ar.json").then((m) => m.default),
} satisfies Record<Locale, () => Promise<Dictionary>>;

export const getDictionary = cache(async (locale: Locale): Promise<Dictionary> => dictionaries[locale]());
