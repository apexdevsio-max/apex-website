/**
 * The named author behind the technical guides.
 *
 * Separate from `socialLinks` because these describe a **Person**, not the
 * Organization. Mixing the two is the mistake this file exists to prevent: a
 * personal portfolio URL inside the Organization's `sameAs` tells search engines
 * that APEX and that individual are the same real-world entity, which weakens
 * entity resolution rather than strengthening it. A Person node with its own
 * `sameAs` is where a personal site legitimately belongs.
 *
 * Why a named author at all: many of these guides cover regulated subjects —
 * SAMA licensing, PDPL, DHA health requirements. Search engines hold pages
 * making regulatory claims to a stricter standard, and "APEX Team" substantiates
 * nothing. A named person with a verifiable professional footprint does.
 *
 * Every value reads from an env var first so the public identity can be filled
 * in from the deployment dashboard. While `name` is blank the whole Person node
 * is omitted and articles fall back to team attribution — see
 * `buildPersonSchema` in lib/seo/schema.tsx.
 */
export const author = {
  /** Full name as it should appear in the byline. Blank disables the Person node. */
  name: process.env.NEXT_PUBLIC_AUTHOR_NAME || "",
  /** Arabic form of the name; falls back to `name` when unset. */
  nameAr: process.env.NEXT_PUBLIC_AUTHOR_NAME_AR || "",
  /** Role, e.g. "Founder & Lead Engineer". Shown on /about, not in the byline. */
  jobTitle: process.env.NEXT_PUBLIC_AUTHOR_TITLE || "",
  jobTitleAr: process.env.NEXT_PUBLIC_AUTHOR_TITLE_AR || "",
  /**
   * Personal site or portfolio. This is the correct home for a personal URL —
   * it identifies the Person, never the Organization.
   */
  url: process.env.NEXT_PUBLIC_AUTHOR_URL || "",
  /** Personal LinkedIn — distinct from the company page in socialLinks.linkedin. */
  linkedin: process.env.NEXT_PUBLIC_AUTHOR_LINKEDIN || "",
  /** Optional: GitHub, X, or another professional profile. */
  github: process.env.NEXT_PUBLIC_AUTHOR_GITHUB || "",
} as const;

/** True when enough is configured to emit a meaningful Person node. */
export function hasNamedAuthor(): boolean {
  return author.name.trim().length > 0;
}

/**
 * The author's own profile URLs, blanks removed.
 *
 * These belong to the Person and must never be spread into the Organization's
 * `sameAs`. An empty array is omitted by callers for the same reason it is on
 * Organization: asserting "this person has no profiles" is weaker than silence.
 */
export function authorSameAs(): string[] {
  return [author.url, author.linkedin, author.github].filter(Boolean);
}
