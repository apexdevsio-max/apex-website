import { getPostCategoryKeys } from "@/lib/content/taxonomy";
import { hasNamedAuthor } from "@/data/author";

/**
 * Decides whether an article is attributed to the named author or to the team.
 *
 * Not every article benefits equally from a personal byline. The ones that do
 * are those making claims a reader is entitled to challenge: regulatory
 * requirements, technical judgements, cost estimates. Search engines apply a
 * stricter standard to pages asserting regulated facts, and an unattributed page
 * substantiates none of it.
 *
 * Listing-style and general commercial pieces stay with team attribution, which
 * is both honest — they are company positions rather than individual analysis —
 * and avoids the oddity of one name appearing on every page a company publishes.
 *
 * Falls back to "team" whenever no author is configured, so the byline never
 * renders a blank name.
 */
export type Byline = "person" | "team";

/**
 * Categories whose articles carry personal attribution.
 *
 * `selected` covers the compliance and specialist guides, `lang-framework` the
 * deep technical ones. Both are where a named engineer's judgement is the value
 * being offered, and where E-E-A-T scrutiny is highest.
 */
const PERSONAL_CATEGORIES = new Set(["selected", "lang-framework"]);

export function bylineFor(slug: string): Byline {
  if (!hasNamedAuthor()) return "team";
  const categories = getPostCategoryKeys(slug);
  return categories.some((key) => PERSONAL_CATEGORIES.has(key)) ? "person" : "team";
}
