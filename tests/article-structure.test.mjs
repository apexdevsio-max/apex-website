import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const blogRoot = path.join(root, "content", "blog");

/**
 * Loads the heading helpers out of lib/content/headings.ts.
 *
 * Follows the approach tests/seo-schema.test.mjs uses for `extractFaqs`: Node
 * cannot import TypeScript, and these functions are pure and import-free, so the
 * annotations are erased and the module is evaluated on its own rather than
 * adding a TypeScript toolchain for three functions.
 */
async function loadHeadingHelpers() {
  const source = await readFile(path.join(root, "lib", "content", "headings.ts"), "utf8");

  const js = source
    .replace(/^export type[\s\S]*?};$/gm, "")
    .replace(/export function/g, "function")
    .replace(/\(text: string\): string/g, "(text)")
    .replace(/\(node: unknown\): string/g, "(node)")
    .replace(/\(raw: string\): string/g, "(raw)")
    .replace(/\(markdown: string\): TocEntry\[\]/g, "(markdown)")
    .replace(/const entries: TocEntry\[\] =/, "const entries =")
    .replace(/const used = new Map<string, number>\(\)/, "const used = new Map()")
    .replace(/as \{ props\?: \{ children\?: unknown \} \}/, "")
    .replace(/level: match\[1\]\.length === 2 \? 2 : 3,/, "level: match[1].length === 2 ? 2 : 3,");

  return new Function(`${js}\nreturn { slugifyHeading, collectHeadings };`)();
}

async function blogFiles() {
  return (await readdir(blogRoot)).filter((name) => name.endsWith(".mdx")).sort();
}

/**
 * The table of contents links to `#id`, and MarkdownContent stamps that id onto
 * the heading. They derive it from different inputs — raw markdown versus the
 * rendered React children — so a heading whose text normalises to nothing would
 * produce a TOC entry pointing at an anchor that does not exist.
 */
test("every article heading yields a non-empty anchor id", async () => {
  const { collectHeadings } = await loadHeadingHelpers();

  for (const file of await blogFiles()) {
    const source = await readFile(path.join(blogRoot, file), "utf8");
    const entries = collectHeadings(source);

    assert.ok(entries.length > 0, `${file} has no ## headings to index`);

    for (const entry of entries) {
      assert.ok(entry.id, `${file}: heading "${entry.text}" produced an empty id`);
      assert.ok(
        !/[\s#?/]/.test(entry.id),
        `${file}: id "${entry.id}" contains a character that breaks a URL fragment`
      );
    }

    const ids = entries.map((entry) => entry.id);
    assert.equal(
      new Set(ids).size,
      ids.length,
      `${file} produced duplicate heading ids, which makes an anchor ambiguous`
    );
  }
});

/** Arabic headings must stay readable in the URL rather than percent-encoding. */
test("Arabic headings keep their letters in the anchor id", async () => {
  const { slugifyHeading } = await loadHeadingHelpers();

  assert.equal(slugifyHeading("الأسئلة الشائعة"), "الأسئلة-الشائعة");
  // Diacritics are optional in practice, so an id must not depend on them.
  assert.equal(slugifyHeading("الأسئلةُ الشائعة"), slugifyHeading("الأسئلة الشائعة"));
  // Inline markdown and numbering must not leak into the fragment.
  assert.equal(slugifyHeading("4. `font-display` — preventing invisible text"), "4-font-display-preventing-invisible-text");
});

/**
 * A `#` inside a fenced code block is a comment, not a heading. Several guides
 * contain shell and Dart snippets that would otherwise add phantom TOC entries
 * pointing at ids no heading carries.
 */
test("code fences never contribute headings", async () => {
  const { collectHeadings } = await loadHeadingHelpers();

  const entries = collectHeadings(
    ["## Real heading", "", "```bash", "## not a heading", "```", "", "## Another heading"].join("\n")
  );

  assert.deepEqual(
    entries.map((entry) => entry.text),
    ["Real heading", "Another heading"]
  );
});

/**
 * FAQ questions are `###` headings rather than bold paragraphs. Both shapes are
 * understood by `extractFaqs`, but only the heading shape puts the question in
 * the document outline — which is what makes it addressable by anchor and
 * quotable as a discrete unit by AI answer engines.
 */
test("FAQ questions are headings, not bold paragraphs", async () => {
  const faqHeading = /^##[^\S\n]+(?:الأسئلة الشائعة|Frequently asked questions|FAQ)[^\S\n]*$/im;

  for (const file of await blogFiles()) {
    const source = await readFile(path.join(blogRoot, file), "utf8");
    const match = faqHeading.exec(source);
    assert.ok(match, `${file} has no FAQ section`);

    const rest = source.slice(match.index + match[0].length);
    const next = /^##[^\S\n]+/m.exec(rest);
    const block = next ? rest.slice(0, next.index) : rest;

    const headings = (block.match(/^###[^\S\n]+/gm) ?? []).length;
    assert.ok(headings >= 3, `${file}: FAQ section has only ${headings} question headings`);

    const boldOnlyLines = (block.match(/^\*\*(.+?)\*\*[^\S\n]*$/gm) ?? []).length;
    assert.equal(
      boldOnlyLines,
      0,
      `${file}: FAQ still has ${boldOnlyLines} question(s) written as a bold paragraph`
    );
  }
});

/**
 * Fenced code renders through a dedicated `pre` component. Without it the block
 * inherited the article's prose flow — indentation collapsed and, inside the
 * Arabic article's `dir="rtl"` wrapper, the source rendered right-to-left.
 */
test("markdown renderer styles fenced code blocks", async () => {
  const source = await readFile(
    path.join(root, "components", "content", "MarkdownContent.tsx"),
    "utf8"
  );

  assert.match(source, /pre:\s*\(\{\s*children\s*\}\)/, "MarkdownContent must define a `pre` component");
  assert.match(source, /<pre[^>]*dir="ltr"/, "code blocks must be pinned to LTR inside RTL articles");
  assert.match(source, /apex-prose-pre/, "code blocks must carry the prose code styling");

  const css = await readFile(path.join(root, "app", "globals.css"), "utf8");
  const rule = /\.apex-prose-pre\s*\{([^}]*)\}/.exec(css);
  assert.ok(rule, ".apex-prose-pre must be defined in globals.css");
  assert.match(rule[1], /overflow-x:\s*auto/, "a long code line must scroll in its own box");
  assert.match(rule[1], /white-space:\s*pre/, "code must preserve the author's line breaks");
});

/** Headings carry ids, which is what earns "jump to" links under a search result. */
test("markdown renderer stamps ids onto headings", async () => {
  const source = await readFile(
    path.join(root, "components", "content", "MarkdownContent.tsx"),
    "utf8"
  );

  for (const tag of ["h1", "h2", "h3"]) {
    const rule = new RegExp(`${tag}:\\s*\\(\\{ children \\}\\) => <h[23] id=\\{headingId\\(children\\)\\}`);
    assert.match(source, rule, `${tag} must render with a generated id`);
  }
});
