import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

/**
 * Guards the category and pagination structure that lets the blog scale past a
 * few dozen articles. The failure modes here are all silent: the site keeps
 * building and looks correct in a browser while the archive quietly stops being
 * crawlable, or starts serving the same listing at two URLs.
 */

/** Category slugs declared in the taxonomy, which is the single source of truth. */
async function categorySlugs() {
  const source = await readFile(path.join(root, "lib", "content", "taxonomy.ts"), "utf8");
  return [...source.matchAll(/^\s{4}slug: "([a-z0-9-]+)",$/gm)].map((m) => m[1]);
}

test("every category has a slug, a label and a description in both locales", async () => {
  const source = await readFile(path.join(root, "lib", "content", "taxonomy.ts"), "utf8");
  const slugs = await categorySlugs();

  assert.ok(slugs.length >= 6, `expected at least 6 categories, found ${slugs.length}`);
  assert.equal(new Set(slugs).size, slugs.length, "two categories share a URL slug");

  // A category page whose only unique text is its title reads as thin content,
  // so the description is what makes each one substantive enough to rank.
  const descriptions = [...source.matchAll(/description: \{\s*ar: "([^"]+)",\s*en: "([^"]+)"/g)];
  assert.equal(
    descriptions.length,
    slugs.length,
    "a category is missing its bilingual description"
  );
});

test("every category referenced by an article resolves to a real category", async () => {
  const [taxonomy, blogData] = await Promise.all([
    readFile(path.join(root, "lib", "content", "taxonomy.ts"), "utf8"),
    readFile(path.join(root, "lib", "mock", "blog-data.ts"), "utf8"),
  ]);

  const known = new Set([...taxonomy.matchAll(/^\s{4}key: "([a-z-]+)",$/gm)].map((m) => m[1]));
  assert.ok(known.size > 0, "no category keys parsed out of the taxonomy");

  // POST_META rows drive the card badge and the category pages. A key here that
  // the taxonomy does not know about would render a badge linking to a 404.
  const metaBlock = /export const POST_META[\s\S]*?\n};/.exec(blogData)?.[0] ?? "";
  const used = new Set(
    [...metaBlock.matchAll(/categories:\s*\[([^\]]+)\]/g)].flatMap((m) =>
      [...m[1].matchAll(/"([a-z-]+)"/g)].map((c) => c[1])
    )
  );

  for (const key of used) {
    assert.ok(known.has(key), `POST_META uses category "${key}" which the taxonomy does not define`);
  }
});

test("page one of a listing is never also served at /page/1", async () => {
  const files = [
    path.join(root, "components", "content", "Pagination.tsx"),
    path.join(root, "app", "[lang]", "blog", "page", "[page]", "page.tsx"),
    path.join(root, "app", "[lang]", "blog", "category", "[slug]", "page", "[page]", "page.tsx"),
  ];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    // Both routes 404 below page 2, and the pager links page one at the bare path.
    // Without this, /blog and /blog/page/1 are duplicate content competing for the
    // same query.
    assert.match(
      source,
      /target === 1 \? basePath|parsed < 2/,
      `${path.basename(path.dirname(file))} does not special-case page one`
    );
  }
});

test("paginated listings are noindex but still followed", async () => {
  const listing = await readFile(path.join(root, "app", "[lang]", "blog", "listing.ts"), "utf8");
  const category = await readFile(
    path.join(root, "app", "[lang]", "blog", "category", "[slug]", "category-listing.tsx"),
    "utf8"
  );

  for (const [name, source] of [["listing.ts", listing], ["category-listing.tsx", category]]) {
    // `follow` is the half that matters: it is what lets crawlers walk the pager
    // to reach articles that appear on no other page.
    assert.match(
      source,
      /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/,
      `${name} does not mark paginated listings noindex, follow`
    );
  }
});

test("the article grid renders on the server", async () => {
  const grid = await readFile(path.join(root, "components", "sections", "BlogGrid.tsx"), "utf8");

  // The grid used to be a client component filtering every article in the browser,
  // which put the whole archive into the payload of a page showing twelve cards.
  const code = grid.replace(/\/\*\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  assert.doesNotMatch(code, /^"use client"/m, "BlogGrid is a client component again");
  assert.doesNotMatch(code, /\buseState\b|\buseMemo\b/, "BlogGrid filters on the client again");
});

test("category navigation and pagination are links, not buttons", async () => {
  const nav = await readFile(path.join(root, "components", "content", "CategoryNav.tsx"), "utf8");
  const pager = await readFile(path.join(root, "components", "content", "Pagination.tsx"), "utf8");

  // As <button onClick> these produced no URL, so the groupings existed for
  // visitors but were invisible to search engines and could not be linked to.
  for (const [name, source] of [["CategoryNav", nav], ["Pagination", pager]]) {
    // Match JSX only. The doc comments in both files mention `<button>` when
    // explaining what these used to be, so a bare /<button/ matches the prose.
    const code = source.replace(/\/\*\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
    assert.doesNotMatch(code, /<button[\s>]/, `${name} renders buttons instead of crawlable links`);
    assert.match(code, /<Link\b/, `${name} does not render links`);
  }
});

test("built category pages are indexable and list their articles", async () => {
  const slugs = await categorySlugs();

  for (const slug of slugs) {
    const file = path.join(root, ".next", "server", "app", "en", "blog", "category", `${slug}.html`);
    let html;
    try {
      html = await readFile(file, "utf8");
    } catch {
      return; // No build in this working tree.
    }

    assert.doesNotMatch(
      html,
      /<meta name="robots" content="[^"]*noindex/,
      `category ${slug} is noindexed — it should be a rankable landing page`
    );
    assert.match(html, /<h1[^>]*>/, `category ${slug} has no H1`);
    assert.match(
      html,
      /<link rel="canonical" href="https:\/\/apex\.sy\/en\/blog\/category\//,
      `category ${slug} has no self-canonical`
    );

    const articles = new Set(
      [...html.matchAll(/href="\/en\/blog\/([a-z0-9-]+)"/g)]
        .map((m) => m[1])
        .filter((s) => s !== "category")
    );
    assert.ok(articles.size > 0, `category ${slug} lists no articles`);
  }
});

test("the sitemap lists category pages but not paginated ones", async () => {
  const built = path.join(root, ".next", "server", "app", "sitemap.xml.body");
  let xml;
  try {
    xml = await readFile(built, "utf8");
  } catch {
    return;
  }

  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const categories = locs.filter((url) => url.includes("/blog/category/"));

  assert.ok(categories.length > 0, "sitemap lists no blog category pages");

  // Paginated URLs are noindex; advertising them in the sitemap asks crawlers to
  // index pages that then refuse to be indexed.
  const paginated = locs.filter((url) => /\/page\/\d+$/.test(url));
  assert.deepEqual(paginated, [], `sitemap lists noindexed paginated URLs: ${paginated.join(", ")}`);
});

test("each locale exposes an RSS feed of its articles", async () => {
  for (const lang of ["en", "ar"]) {
    const file = path.join(root, ".next", "server", "app", lang, "blog", "feed.xml.body");
    let xml;
    try {
      xml = await readFile(file, "utf8");
    } catch {
      return;
    }

    assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/, `${lang} feed is not valid XML`);
    assert.match(xml, /<atom:link[^>]+rel="self"/, `${lang} feed declares no self link`);
    assert.match(xml, new RegExp(`<language>${lang}</language>`), `${lang} feed declares no language`);

    const items = [...xml.matchAll(/<item>/g)].length;
    assert.ok(items > 0, `${lang} feed contains no items`);

    // Raw & in a title breaks the feed for every reader that parses it strictly.
    const unescaped = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/.exec(xml);
    assert.equal(unescaped, null, `${lang} feed contains an unescaped ampersand`);

    // Newest first — a feed in filename order buries the article that prompted
    // the crawl.
    const dates = [...xml.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].map((m) =>
      new Date(m[1]).getTime()
    );
    const sorted = [...dates].sort((a, b) => b - a);
    assert.deepEqual(dates, sorted, `${lang} feed is not sorted newest-first`);
  }
});
