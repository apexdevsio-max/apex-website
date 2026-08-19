/**
 * Heading anchors for long-form articles.
 *
 * Two consumers need to agree on the exact same id for a given heading: the
 * markdown renderer, which stamps `id` onto the rendered `<h2>`/`<h3>`, and the
 * table of contents, which links to it. They derive ids from different inputs —
 * the renderer from React children, the TOC from raw markdown source — so the
 * text-normalising step lives here and both call it.
 */

/**
 * Builds a URL-safe id from heading text.
 *
 * Arabic headings are the common case, and percent-encoding them would produce
 * unreadable fragments like `#%D8%A7%D9%84%D8%A3%D8%B3%D8%A6%D9%84%D8%A9`, so
 * Arabic letters are kept verbatim — they are valid in a URL fragment and every
 * modern browser displays them decoded. Only characters that would break the
 * fragment (spaces, punctuation, markdown syntax) are stripped or replaced.
 */
export function slugifyHeading(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    // Arabic diacritics carry no lexical weight, and whether an author typed
    // them varies, so an id must not depend on their presence.
    .replace(/[ً-ْٰـ]/g, "")
    // Keep letters and digits in any script, plus spaces and hyphens.
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Flattens a React children tree to its text, so a heading containing inline
 * markup (`## 4. \`font-display\` — preventing invisible text`) yields the same
 * text the reader sees rather than dropping the code span.
 */
export function headingText(node: unknown): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(headingText).join("");
  if (typeof node === "object" && "props" in node) {
    return headingText((node as { props?: { children?: unknown } }).props?.children);
  }
  return "";
}

export type TocEntry = {
  id: string;
  text: string;
  level: 2 | 3;
};

/** Strips the inline markdown that appears inside heading text. */
function plainHeading(raw: string): string {
  return raw
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Collects the `##`/`###` headings of an article, in document order, for the
 * table of contents.
 *
 * Fenced code blocks are skipped: a `# comment` line inside a shell or Dart
 * snippet is not a heading, and several articles contain them.
 *
 * Ids are de-duplicated with a numeric suffix. Two headings can legitimately
 * normalise to the same slug (several articles use "Cost table" twice), and
 * duplicate ids would make the anchor ambiguous.
 */
export function collectHeadings(markdown: string): TocEntry[] {
  const entries: TocEntry[] = [];
  const used = new Map<string, number>();
  let inFence = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(##|###)\s+(.+?)\s*$/.exec(line);
    if (!match) continue;

    const text = plainHeading(match[2]);
    if (!text) continue;

    const base = slugifyHeading(text);
    if (!base) continue;

    const seen = used.get(base) ?? 0;
    used.set(base, seen + 1);

    entries.push({
      id: seen === 0 ? base : `${base}-${seen + 1}`,
      text,
      level: match[1].length === 2 ? 2 : 3,
    });
  }

  return entries;
}
