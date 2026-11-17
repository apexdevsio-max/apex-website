import type { CategoryKey } from "@/lib/content/taxonomy";
import { hasNamedAuthor } from "@/data/author";

export type Byline = "person" | "team";

/**
 * Articles that make claims a reader is entitled to challenge (regulation,
 * technical judgement) carry the named author when one is configured; general
 * commercial pieces stay with the team. Falls back to the team while no author
 * is configured, so the byline never renders a blank name.
 */
const PERSONAL_CATEGORIES: ReadonlySet<CategoryKey> = new Set(["compliance", "arabic", "mobile", "ai"]);

export function bylineFor(categories: readonly CategoryKey[]): Byline {
  if (!hasNamedAuthor()) return "team";
  return categories.some((key) => PERSONAL_CATEGORIES.has(key)) ? "person" : "team";
}
