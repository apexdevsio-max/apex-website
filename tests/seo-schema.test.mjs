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

test("llms.txt never advertises a section that is noindexed", async () => {
  const llms = await readFile(path.join(root, "public", "llms.txt"), "utf8");

  // Academy is noindex,follow on all three of its route levels while the course
  // content is incomplete. Listing it in llms.txt contradicts that: the file
  // exists so AI answer engines discover content, and pointing them at pages the
  // site asks search engines to skip is the same mixed signal in a different
  // channel. If Academy is ever re-enabled, drop the noindex first, then re-add
  // the links here.
  const academyRoutes = [
    "app/[lang]/academy/page.tsx",
    "app/[lang]/academy/[course]/page.tsx",
    "app/[lang]/academy/[course]/[lesson]/page.tsx",
  ];

  const noindexed = await Promise.all(
    academyRoutes.map(async (route) => {
      const source = await readFile(path.join(root, route), "utf8");
      return /robots\s*:\s*\{[^}]*index\s*:\s*false/.test(source);
    })
  );

  if (noindexed.every(Boolean)) {
    for (const locale of ["en", "ar"]) {
      assert.ok(
        !llms.includes(`https://apex.sy/${locale}/academy`),
        `llms.txt links /${locale}/academy while every academy route sets robots.index = false`
      );
    }
  }
});

/**
 * `sameAs` is what ties this site to the company's off-site profiles, and it is
 * the strongest entity signal a small site can send. An empty `sameAs: []` is a
 * weaker signal than omitting the property — it asserts "this entity has no
 * profiles" rather than staying silent — so the schema builders must spread it
 * conditionally rather than assign it.
 *
 * This shipped as `"sameAs":[]` on every page: the helper filtered blanks
 * correctly and two of the three callers then assigned the empty result anyway.
 */
test("organization schema omits sameAs rather than emitting an empty array", async () => {
  const source = await readFile(path.join(root, "lib", "seo", "schema.tsx"), "utf8");

  const unconditional = [...source.matchAll(/^\s*sameAs: organizationSameAs\(\),?$/gm)];
  assert.deepEqual(
    unconditional.map((m) => m[0].trim()),
    [],
    "a schema builder assigns organizationSameAs() unconditionally, which emits sameAs: [] while the social profiles are unset"
  );

  // The built artifact is the check that would actually have caught this.
  const built = path.join(root, ".next", "server", "app", "en.html");
  let html;
  try {
    html = await readFile(built, "utf8");
  } catch {
    return; // No build in this working tree; the source check above still applies.
  }
  assert.doesNotMatch(
    html,
    /"sameAs":\[\]/,
    "built pages emit an empty sameAs array"
  );
});

/**
 * The Person and Organization nodes describe different real-world entities and
 * must not share profile URLs.
 *
 * A personal portfolio or personal LinkedIn inside the Organization's `sameAs`
 * asserts that the company and the individual are the same entity, which
 * degrades entity resolution rather than strengthening it. The correct home for
 * a personal URL is the Person node's own `sameAs`, linked to the company via
 * `worksFor`.
 */
test("author profiles never leak into the organization's sameAs", async () => {
  const schema = await readFile(path.join(root, "lib", "seo", "schema.tsx"), "utf8");

  // organizationSameAs() must be built only from socialLinks — the company's
  // accounts. Any reference to the author data inside it is the bug.
  const orgFn = /function organizationSameAs\(\)[\s\S]*?\n}/.exec(schema);
  assert.ok(orgFn, "organizationSameAs() not found");
  assert.doesNotMatch(
    orgFn[0],
    /author/i,
    "organizationSameAs() references author data, which merges the person and company entities"
  );

  // And the reverse: authorSameAs() must not pull from the company's profiles.
  const authorFile = await readFile(path.join(root, "data", "author.ts"), "utf8");
  const authorFn = /export function authorSameAs\(\)[\s\S]*?\n}/.exec(authorFile);
  assert.ok(authorFn, "authorSameAs() not found");
  assert.doesNotMatch(
    authorFn[0],
    /socialLinks/,
    "authorSameAs() references company profiles"
  );
});

test("the Person node is only emitted when an author is configured", async () => {
  const schema = await readFile(path.join(root, "lib", "seo", "schema.tsx"), "utf8");

  // Without the guard, an unconfigured deployment emits a Person with an empty
  // name — an entity claim with nothing behind it, which is worse than silence.
  const personFn = /export function buildPersonSchema[\s\S]*?\n}/.exec(schema);
  assert.ok(personFn, "buildPersonSchema not found");
  assert.match(
    personFn[0],
    /if \(!hasNamedAuthor\(\)\) return undefined;/,
    "buildPersonSchema does not guard on hasNamedAuthor()"
  );

  // The built artifact is the check that would actually catch a regression.
  const built = path.join(root, ".next", "server", "app", "en", "blog", "gulf-compliance-guide.html");
  let html;
  try {
    html = await readFile(built, "utf8");
  } catch {
    return; // No build in this working tree.
  }
  assert.doesNotMatch(
    html,
    /"@type":"Person","@id":"[^"]*","name":""/,
    "a Person node was emitted with an empty name"
  );
});
