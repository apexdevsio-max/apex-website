import assert from "node:assert/strict";
import test from "node:test";

import sitemap from "../app/sitemap.ts";
import nextConfig from "../next.config.ts";
import { buildPageMeta, buildPageMetadata } from "@/lib/seo/metadata";
import { buildBlogPostingSchema, buildCreativeWorkSchema, buildOrganizationSchema } from "@/lib/seo/schema";
import { buildLlmsTxt } from "@/lib/seo/llms";
import { getBlogPosts } from "@/lib/content/content-loader";

const SITE = "https://apex.sy";

test("the sitemap lists each URL once, both languages equally, with real dates", async () => {
  const entries = await sitemap();
  const urls = entries.map((e) => e.url);
  assert.equal(new Set(urls).size, urls.length, "duplicate URLs");
  const count = (l) => urls.filter((u) => u.startsWith(`${SITE}/${l}`)).length;
  assert.equal(count("en"), count("ar"));
  assert.ok(!urls.some((u) => /academy|app-development-company-riyadh|\/page\/\d/.test(u)), "removed or paginated URLs are listed");
  const today = new Date().toISOString().slice(0, 10);
  for (const entry of entries) {
    if (!entry.lastModified) continue;
    assert.match(String(entry.lastModified), /^\d{4}-\d{2}-\d{2}/);
    assert.ok(!String(entry.lastModified).includes("T"), `${entry.url} carries a timestamp, which means a build time slipped in`);
  }
  assert.ok(entries.every((e) => e.alternates.languages["x-default"]), "every entry carries x-default");
  void today;
});

test("page metadata: Arabic locale code, root x-default on the home page, article tags on articles", () => {
  const home = buildPageMetadata("ar");
  assert.equal(home.openGraph.locale, "ar_AR");
  assert.equal(home.alternates.languages["x-default"], `${SITE}/`);
  assert.deepEqual(home.title, { absolute: home.title.absolute });

  const article = buildPageMeta("en", {
    title: "T",
    description: "D",
    path: "/en/blog/x",
    imageFallback: `${SITE}/en/blog/x/opengraph-image`,
    article: { publishedTime: "2026-08-15" },
  });
  assert.equal(article.openGraph.type, "article");
  assert.equal(article.openGraph.images[0].url, `${SITE}/en/blog/x/opengraph-image`);
  assert.equal(article.openGraph.images[0].alt, "T");
  assert.equal(article.alternates.languages["x-default"], `${SITE}/en/blog/x`);
  assert.ok(article.alternates.types["application/rss+xml"]);
});

test("structured data is one linked graph with absolute images", () => {
  const org = buildOrganizationSchema("en");
  assert.equal(org["@type"], "Organization");
  assert.equal(org.logo.width, 512);
  if (!process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN && !process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM && !process.env.NEXT_PUBLIC_SOCIAL_TWITTER) {
    assert.equal("sameAs" in org, false, "an empty sameAs must be omitted");
  }
  const post = buildBlogPostingSchema({ title: "t", excerpt: "e", url: `${SITE}/en/blog/x`, lang: "en", byline: "team" });
  assert.equal(post.image, `${SITE}/en/blog/x/opengraph-image`);
  assert.deepEqual(post.publisher, { "@id": `${SITE}/#organization` });
  const work = buildCreativeWorkSchema({ title: "t", summary: "s", url: `${SITE}/en/portfolio/x`, image: "/images/a.jpg", lang: "en" });
  assert.equal(work.image, `${SITE}/images/a.jpg`);
});

test("llms.txt has one title, a summary, and every article", async () => {
  for (const lang of ["en", "ar"]) {
    const text = await buildLlmsTxt(lang);
    assert.equal((text.match(/^# /gm) ?? []).length, 1);
    assert.match(text, /^> /m);
    for (const post of await getBlogPosts(lang)) assert.ok(text.includes(`/${lang}/blog/${post.slug})`), `${lang} llms.txt misses ${post.slug}`);
    assert.doesNotMatch(text, /academy|uiux-design|\/services\/ecommerce/);
  }
});

test("removed and renamed URLs redirect permanently", async () => {
  const redirects = await nextConfig.redirects();
  const find = (source) => redirects.find((r) => r.source === source);
  assert.equal(find("/:lang(en|ar)/blog/app-development-company-riyadh")?.destination, "/:lang/blog/gulf-app-development-guide");
  assert.equal(find("/:lang(en|ar)/portfolio/category/:slug")?.permanent, true);
  assert.ok(find("/:lang(en|ar)/academy/:path*"));
  assert.ok(find("/:lang(en|ar)/blog/category/practical-guides"));
  // Uppercase locales redirect to lowercase; this only works with exact matching.
  assert.equal(find("/EN/:path*")?.destination, "/en/:path*");
  assert.equal(find("/aR")?.destination, "/ar");
  assert.equal(nextConfig.experimental.caseSensitiveRoutes, true);
});
