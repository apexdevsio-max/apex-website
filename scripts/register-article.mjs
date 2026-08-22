/**
 * Registers a new blog article in the four places the test suite requires.
 *
 * A new article is not just its two MDX files: without a POST_META row it falls
 * into the default "selected" category behind a generic icon, without a
 * PUBLISHED_POST_SLUGS entry the related-posts logic cannot see it, without
 * POST_KEYWORDS it ships with no keywords meta, and without an llms.txt line the
 * content-integrity test fails the build. Doing this by hand across four files
 * is how one of them gets missed.
 *
 * Usage:
 *   node scripts/register-article.mjs config.json
 *
 * The config is a JSON object:
 *   {
 *     "slug": "my-article",
 *     "emoji": "📘",
 *     "accentColor": "#FFBF00",
 *     "categories": ["selected", "practical"],
 *     "readTime": 8,
 *     "keywords": { "ar": [...], "en": [...] },
 *     "llms": { "en": {"title": "Title", "summary": "one-line summary."}, "ar": {...} }
 *   }
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();

/** Inserts `line` before the first line matching `anchorPattern`. */
function insertBefore(source, anchorPattern, line, label) {
  const index = source.search(anchorPattern);
  if (index === -1) throw new Error(`Anchor not found for ${label}`);
  return source.slice(0, index) + line + source.slice(index);
}

/**
 * The anchor is the entry that should follow ours alphabetically. Each list in
 * these files is sorted by slug, so inserting before the first entry that sorts
 * after us keeps that order intact.
 */
function anchorAfter(source, pattern, slug) {
  const matches = [...source.matchAll(pattern)];
  const next = matches.find((m) => m[1] > slug);
  // Returns null for a slug that sorts last — the caller appends after the final
  // entry instead. Throwing here left the earlier files half-updated, which the
  // content-integrity tests then failed on.
  return next ? next[0] : null;
}

/** The last entry matching `pattern`, used as the append point. */
function lastMatch(source, pattern, label) {
  const matches = [...source.matchAll(pattern)];
  if (matches.length === 0) throw new Error(`No entries found for ${label}`);
  return matches[matches.length - 1];
}

/** Inserts `line` immediately after the last entry matching `pattern`. */
function insertAfterLast(source, pattern, line, label) {
  const last = lastMatch(source, pattern, label);
  const at = last.index + last[0].length;
  const eol = source.includes("\r\n") ? "\r\n" : "\n";
  return source.slice(0, at) + eol + line.replace(/\r?\n$/, "") + source.slice(at);
}

async function main() {
  const configPath = process.argv[2];
  if (!configPath) {
    console.error("Usage: node scripts/register-article.mjs <config.json>");
    process.exit(1);
  }

  const config = JSON.parse(await readFile(configPath, "utf8"));
  const { slug, emoji, accentColor, categories, readTime, keywords, llms } = config;

  // 1. POST_META and PUBLISHED_POST_SLUGS
  const blogDataPath = path.join(root, "lib", "mock", "blog-data.ts");
  let blogData = await readFile(blogDataPath, "utf8");

  if (blogData.includes(`"${slug}": {`)) {
    console.log(`POST_META already has ${slug} — skipping`);
  } else {
    const metaPattern = /^ {2}"([a-z0-9-]+)": \{ emoji:/gm;
    const metaAnchor = anchorAfter(blogData, metaPattern, slug);
    const metaLine = `  "${slug}": { emoji: "${emoji}", accentColor: "${accentColor}", categories: [${categories
      .map((c) => `"${c}"`)
      .join(",")}], readTime: ${readTime} },\n`;
    blogData = metaAnchor
      ? insertBefore(blogData, new RegExp(escapeRegex(metaAnchor)), metaLine, "POST_META")
      : insertAfterLast(blogData, /^ {2}"[a-z0-9-]+": \{ emoji:.*$/gm, metaLine, "POST_META");
  }

  if (blogData.includes(`  "${slug}",`)) {
    console.log(`PUBLISHED_POST_SLUGS already has ${slug} — skipping`);
  } else {
    const slugAnchor = anchorAfter(blogData, /^ {2}"([a-z0-9-]+)",$/gm, slug);
    blogData = slugAnchor
      ? insertBefore(
          blogData,
          new RegExp(escapeRegex(slugAnchor)),
          `  "${slug}",\n`,
          "PUBLISHED_POST_SLUGS"
        )
      : insertAfterLast(blogData, /^ {2}"[a-z0-9-]+",$/gm, `  "${slug}",`, "PUBLISHED_POST_SLUGS");
  }

  await writeFile(blogDataPath, blogData, "utf8");

  // 2. POST_KEYWORDS
  const pagePath = path.join(root, "app", "[lang]", "blog", "[slug]", "page.tsx");
  let page = await readFile(pagePath, "utf8");

  if (page.includes(`  "${slug}": {`)) {
    console.log(`POST_KEYWORDS already has ${slug} — skipping`);
  } else {
    // The first key in POST_KEYWORDS is unquoted (`flutter:`), so quotes are
    // optional. `\r?` matters because these files are checked out with CRLF
    // endings on Windows — without it the anchor never matches.
    const kwAnchor = /^ {2}"?[a-z0-9-]+"?: \{\r?\n {4}ar: \[/m.exec(page);
    if (!kwAnchor) throw new Error("POST_KEYWORDS anchor not found");
    // Match the file's own line endings; mixing LF into a CRLF file leaves a
    // diff that looks like the whole block changed.
    const eol = page.includes("\r\n") ? "\r\n" : "\n";
    const kwLine =
      `  "${slug}": {${eol}` +
      `    ar: [${keywords.ar.map((k) => `"${k}"`).join(", ")}],${eol}` +
      `    en: [${keywords.en.map((k) => `"${k}"`).join(", ")}],${eol}` +
      `  },${eol}`;
    page = page.slice(0, kwAnchor.index) + kwLine + page.slice(kwAnchor.index);
    await writeFile(pagePath, page, "utf8");
  }

  // 3. llms.txt — one line per locale, appended to that locale's guide list.
  const llmsPath = path.join(root, "public", "llms.txt");
  let llmsTxt = await readFile(llmsPath, "utf8");

  for (const locale of ["en", "ar"]) {
    if (llmsTxt.includes(`/${locale}/blog/${slug})`)) {
      console.log(`llms.txt already lists ${locale}/${slug} — skipping`);
      continue;
    }
    // Append after the last guide entry for this locale.
    const entries = [...llmsTxt.matchAll(new RegExp(`^- \\[.+\\]\\(https://apex\\.sy/${locale}/blog/.+\\).*$`, "gm"))];
    if (entries.length === 0) throw new Error(`No ${locale} guide entries found in llms.txt`);
    const last = entries[entries.length - 1];
    const insertAt = last.index + last[0].length;
    const line = `\n- [${llms[locale].title}](https://apex.sy/${locale}/blog/${slug}) — ${llms[locale].summary}`;
    llmsTxt = llmsTxt.slice(0, insertAt) + line + llmsTxt.slice(insertAt);
  }

  await writeFile(llmsPath, llmsTxt, "utf8");
  console.log(`Registered ${slug}`);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
