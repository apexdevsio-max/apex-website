import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

/**
 * Loads `extractFaqs` out of lib/seo/schema.tsx.
 *
 * Node cannot import a .tsx file, and the function is deliberately free of JSX
 * and imports, so it is lifted from the source and evaluated on its own rather
 * than pulling in a TypeScript toolchain for one pure function. The handful of
 * type annotations it does carry are erased first — this mirrors what `tsc`
 * emits, and the runtime behaviour under test is unaffected by their removal.
 */
async function loadExtractFaqs() {
  const source = await readFile(path.join(root, "lib", "seo", "schema.tsx"), "utf8");
  const match = /export function extractFaqs[\s\S]*?\n}/.exec(source);
  assert.ok(match, "extractFaqs must exist in lib/seo/schema.tsx");

  const js = match[0]
    .replace("export function", "function")
    // `(content: string):` return/param annotations, incl. the generic array type.
    .replace(/\(content: string\): Array<\{[^}]*\}>/, "(content)")
    .replace(/const faqs: Array<\{[^}]*\}> =/, "const faqs =")
    .replace(/\(value: string\)/, "(value)")
    .replace(/const faqs: Array<\{ question: string; answer: string \}> =/, "const faqs =");

  return new Function(`${js}\nreturn extractFaqs;`)();
}

async function blogSlugs() {
  const files = await readdir(path.join(root, "content", "blog"));
  return files.filter((name) => name.endsWith(".ar.mdx")).map((name) => name.replace(".ar.mdx", ""));
}

/**
 * Every long-form article ends with a FAQ section, and those questions only
 * become eligible for expandable rich results — and quotable by AI answer
 * engines — when the page emits FAQPage markup. The extractor supports both
 * authoring shapes used across the content (`### Question` headings and bold
 * `**Question?**` paragraphs), so this covers a real article of each shape.
 */
test("FAQ sections are extracted into FAQPage pairs", async () => {
  const extractFaqs = await loadExtractFaqs();

  const cases = [
    "mobile-app-development-cost-gulf.ar.mdx",
    "ecommerce-development-cost-saudi.ar.mdx",
    "app-development-company-riyadh.en.mdx",
    "react-native.ar.mdx",
    "react-native.en.mdx",
  ];

  for (const file of cases) {
    const source = await readFile(path.join(root, "content", "blog", file), "utf8");
    const faqs = extractFaqs(source);

    assert.ok(faqs.length >= 3, `${file} should yield at least 3 FAQ pairs, got ${faqs.length}`);

    for (const { question, answer } of faqs) {
      assert.ok(question.length > 0, `${file} has an empty FAQ question`);
      assert.ok(answer.length > 0, `${file} has an empty FAQ answer`);
      // Google rejects FAQ answers that contain markup, so the extractor must strip it.
      assert.doesNotMatch(answer, /\]\(/, `${file} FAQ answer still contains a markdown link`);
      assert.doesNotMatch(answer, /\*\*/, `${file} FAQ answer still contains bold markup`);
    }
  }
});

test("extractFaqs ignores headings outside the FAQ section", async () => {
  const extractFaqs = await loadExtractFaqs();

  // A `###` heading before the FAQ section must not be picked up as a question.
  const article = [
    "# Title",
    "## Some section",
    "### Not a question",
    "Body text that should never be treated as an answer.",
    "## الأسئلة الشائعة",
    "### هل هذا سؤال؟",
    "نعم، هذه إجابته.",
    "## الخلاصة",
    "### ليس سؤالاً أيضاً",
    "نص الخاتمة.",
  ].join("\n\n");

  const faqs = extractFaqs(article);
  assert.equal(faqs.length, 1, "only questions inside the FAQ section should be extracted");
  assert.equal(faqs[0].question, "هل هذا سؤال؟");
});

test("every published article declares keywords", async () => {
  const page = await readFile(
    path.join(root, "app", "[lang]", "blog", "[slug]", "page.tsx"),
    "utf8"
  );

  for (const slug of await blogSlugs()) {
    // Keys are written quoted or bare depending on whether the slug is a valid
    // identifier, so accept either form.
    const pattern = new RegExp(`^\\s*(?:"${slug}"|${slug})\\s*:`, "m");
    assert.match(
      page,
      pattern,
      `POST_KEYWORDS has no entry for "${slug}" — that post ships with no keywords metadata`
    );
  }
});

test("llms.txt lists every published article in both locales", async () => {
  const llms = await readFile(path.join(root, "public", "llms.txt"), "utf8");

  for (const slug of await blogSlugs()) {
    for (const locale of ["en", "ar"]) {
      assert.ok(
        llms.includes(`https://apex.sy/${locale}/blog/${slug}`),
        `llms.txt is missing the ${locale} URL for "${slug}" — AI answer engines read this file to discover content`
      );
    }
  }
});
