import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

/**
 * These guard SEO regressions that are invisible in the source but corrupt the
 * generated output — the kind that only surface in Search Console weeks later.
 */

test("sitemap emits one entry per URL and covers both locales", async () => {
  const source = await readFile(path.join(root, "app", "sitemap.ts"), "utf8");

  // The original bug hardcoded both locale paths at every push site while `<loc>`
  // stayed pinned to DEFAULT_LOCALE, so each URL was emitted once per locale under
  // /en and no /ar URL was ever listed (67 entries, 38 unique). Paths must be
  // derived from the locale rather than written out per language.
  assert.doesNotMatch(
    source,
    /en: `\/en\/(services|blog|portfolio|academy)\//,
    "sitemap hardcodes /en/ paths instead of deriving them from the locale"
  );
});

test("generated sitemap has no duplicate URLs and lists every locale", async () => {
  // The source-level check above cannot prove the output is correct, so assert on
  // the built artifact when one is present. This is the check that would actually
  // have caught the original regression.
  const built = path.join(root, ".next", "server", "app", "sitemap.xml.body");
  let xml;
  try {
    xml = await readFile(built, "utf8");
  } catch {
    return; // No build in this working tree; the source check above still applies.
  }

  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.length > 0, "sitemap contains no URLs");

  const duplicates = locs.filter((loc, i) => locs.indexOf(loc) !== i);
  assert.deepEqual([...new Set(duplicates)], [], "sitemap contains duplicate <loc> entries");

  // Arabic URLs are declared as hreflang alternates rather than their own <loc>.
  // That is the pattern Google documents for multilingual sitemaps: one entry per
  // page group, every language listed inside it. So assert on the alternates —
  // asserting on <loc> would demand a second entry per page and reintroduce the
  // duplication this test exists to prevent.
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
  assert.equal(entries.length, locs.length, "every <url> must carry exactly one <loc>");

  for (const entry of entries) {
    const loc = /<loc>([^<]+)<\/loc>/.exec(entry)[1];
    for (const locale of ["en", "ar"]) {
      assert.match(
        entry,
        new RegExp(`hreflang="${locale}"`),
        `${loc} is missing its ${locale} hreflang alternate`
      );
    }
  }

  // The Arabic side of the site must actually be reachable from the sitemap.
  const arAlternates = [...xml.matchAll(/hreflang="ar" href="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(
    arAlternates.some((href) => href.includes("/ar/blog/")),
    "sitemap declares no Arabic blog URLs"
  );
});

test("every published blog slug resolves to a real MDX article", async () => {
  const mockData = await readFile(path.join(root, "lib", "mock", "blog-data.ts"), "utf8");
  const block = /export const PUBLISHED_POST_SLUGS = \[([\s\S]*?)\] as const;/.exec(mockData);
  assert.ok(block, "PUBLISHED_POST_SLUGS is missing");

  const slugs = [...block[1].matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]);
  assert.ok(slugs.length > 0, "PUBLISHED_POST_SLUGS is empty");

  const files = new Set(await readdir(path.join(root, "content", "blog")));
  for (const slug of slugs) {
    for (const locale of ["en", "ar"]) {
      assert.ok(
        files.has(`${slug}.${locale}.mdx`),
        `PUBLISHED_POST_SLUGS lists "${slug}" but content/blog/${slug}.${locale}.mdx does not exist`
      );
    }
  }

  // The reverse direction. Checking only that listed slugs have files let the
  // list sit at five entries while 34 further articles shipped, so every article
  // recommended the same three unrelated posts under "Related".
  const onDisk = new Set(
    [...files].filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.(en|ar)\.mdx$/, ""))
  );
  for (const slug of onDisk) {
    assert.ok(
      slugs.includes(slug),
      `content/blog/${slug}.*.mdx exists but PUBLISHED_POST_SLUGS does not list it`
    );
  }
});

test("every published article has presentation metadata", async () => {
  const mockData = await readFile(path.join(root, "lib", "mock", "blog-data.ts"), "utf8");
  const block = /export const POST_META: Record<string, PostMeta> = \{([\s\S]*?)\n\};/.exec(mockData);
  assert.ok(block, "POST_META is missing");

  const labels = /export const CATEGORY_LABELS[^{]*\{([\s\S]*?)\n\};/.exec(mockData);
  assert.ok(labels, "CATEGORY_LABELS is missing");
  const knownCategories = new Set([...labels[1].matchAll(/^\s{2}"?([a-z-]+)"?:/gm)].map((m) => m[1]));

  const files = await readdir(path.join(root, "content", "blog"));
  const slugs = new Set(
    files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.(en|ar)\.mdx$/, ""))
  );

  for (const slug of slugs) {
    const row = new RegExp(`"${slug}":\\s*\\{([^}]*)\\}`).exec(block[1]);
    assert.ok(row, `POST_META has no entry for "${slug}" — its card falls back to a generic icon and the "selected" filter`);

    // A category outside CATEGORY_LABELS renders as its raw key and is
    // unreachable from the filter bar.
    const cats = [...row[1].matchAll(/"([a-z-]+)"/g)].map((m) => m[1]).filter((value) => knownCategories.has(value));
    assert.ok(
      cats.length > 0,
      `POST_META["${slug}"] lists no category present in CATEGORY_LABELS`
    );
  }
});

test("blog routes do not prerender placeholder articles", async () => {
  const page = await readFile(path.join(root, "app", "[lang]", "blog", "[slug]", "page.tsx"), "utf8");

  // Prerendering MOCK_POST_SLUGS published "Content coming soon..." pages as real,
  // indexable routes.
  assert.doesNotMatch(
    page,
    /for \(const slug of MOCK_POST_SLUGS\)/,
    "blog route prerenders placeholder slugs, publishing thin pages"
  );
  assert.match(page, /export const dynamicParams = false/, "unknown blog slugs must 404, not render");
  assert.match(page, /if \(!mdxPost && !mockContent\) notFound\(\)/, "empty posts must 404");
});

test("legacy portfolio URLs redirect permanently", async () => {
  const file = path.join(root, "app", "[lang]", "portfolio", "category", "[slug]", "page.tsx");
  const source = await readFile(file, "utf8");

  // A 307 keeps the old URL indexed and passes no ranking signal to the new one.
  assert.match(source, /permanentRedirect/, "legacy portfolio redirect must be permanent (308)");
  assert.doesNotMatch(source, /^import \{ redirect \}/m, "temporary redirect() leaks the old URL into the index");
});

test("robots.txt omits the deprecated host directive", async () => {
  const source = await readFile(path.join(root, "app", "robots.ts"), "utf8");
  assert.doesNotMatch(source, /^\s*host:/m, "`host:` is ignored by Google and Bing");
  assert.match(source, /sitemap:/, "robots.txt must advertise the sitemap");
});

test("no no-op polyfill replacement plugin is reintroduced", async () => {
  const config = await readFile(path.join(root, "next.config.ts"), "utf8");

  // Next injects polyfill-nomodule (~112 KB) with CopyFilePlugin, which copies it
  // by path rather than resolving it as a module. NormalModuleReplacementPlugin
  // therefore cannot intercept it — a replacement aimed at it strips nothing while
  // appearing to optimise the bundle. Verified against a real build: the emitted
  // chunk hash was byte-identical with and without the plugin.
  assert.doesNotMatch(
    config,
    /NormalModuleReplacementPlugin\(\s*\/polyfill/,
    "polyfill replacement via NormalModuleReplacementPlugin is a no-op; see the note in next.config.ts"
  );
});

test("analytics never blocks the critical rendering path", async () => {
  const source = await readFile(
    path.join(root, "components", "analytics", "AnalyticsConsent.tsx"),
    "utf8"
  );

  assert.match(source, /strategy="lazyOnload"/, "gtag.js must not load during hydration");
  // Analytics must stay behind explicit consent.
  assert.match(source, /consent === "granted" && \(/, "analytics must be gated on consent");
});
