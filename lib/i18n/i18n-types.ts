import type en from "@/dictionaries/en.json";

/**
 * The English dictionary is the schema. tests/content-integrity.test.mjs checks
 * that the Arabic file has exactly the same keys and value types.
 */
export type Dictionary = typeof en;
