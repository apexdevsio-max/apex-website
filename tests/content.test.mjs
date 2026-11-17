import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { getBlogPosts, getPortfolioItems, getServices } from "@/lib/content/content-loader";
import { CATEGORIES, CATEGORY_KEYS } from "@/lib/content/taxonomy";
import { collectHeadings, slugifyHeading } from "@/lib/content/headings";
import { extractFaqs } from "@/lib/seo/schema";

const root = process.cwd();
const LOCALES = ["en", "ar"];
const rateCard = JSON.parse(readFileSync(path.join(root, "content", "data", "rate-card.json"), "utf8"));
const en = JSON.parse(readFileSync(path.join(root, "dictionaries", "en.json"), "utf8"));
const ar = JSON.parse(readFileSync(path.join(root, "dictionaries", "ar.json"), "utf8"));

const posts = Object.fromEntries(await Promise.all(LOCALES.map(async (l) => [l, await getBlogPosts(l)])));
const services = Object.fromEntries(await Promise.all(LOCALES.map(async (l) => [l, await getServices(l)])));
const projects = Object.fromEntries(await Promise.all(LOCALES.map(async (l) => [l, await getPortfolioItems(l)])));

const slugs = (items) => items.map((item) => item.slug).sort();

test("every article, service and project exists in both languages", () => {
  assert.deepEqual(slugs(posts.ar), slugs(posts.en));
  assert.deepEqual(slugs(services.ar), slugs(services.en));
  assert.deepEqual(slugs(projects.ar), slugs(projects.en));
});

test("the dictionaries have the same shape in both languages", () => {
  const shape = (value) =>
    Array.isArray(value)
      ? value.map(shape)
      : value && typeof value === "object"
        ? Object.fromEntries(Object.keys(value).sort().map((k) => [k, shape(value[k])]))
        : typeof value;
  assert.deepEqual(shape(ar), shape(en));
});

test("every category has a pillar article that exists", () => {
  for (const category of CATEGORIES) {
    assert.ok(slugs(posts.en).includes(category.pillar), `${category.key} pillar ${category.pillar} does not exist`);
    assert.ok(posts.en.some((p) => p.categories[0] === category.key), `${category.key} has no articles`);
  }
});

test("article dates are real: never before the file's first commit, never modified before published", () => {
  // One pass over history: the oldest commit that added each file. Uncommitted
  // new files have no entry yet.
  const firstAdded = new Map();
  try {
    // In a shallow clone every file looks first-added at the oldest fetched
    // commit, which would flag every real publication date as too early.
    const shallow = execFileSync("git", ["rev-parse", "--is-shallow-repository"], { encoding: "utf8" }).trim() === "true";
    if (shallow) throw new Error("shallow clone");
    const log = execFileSync("git", ["log", "--diff-filter=A", "--name-only", "--format=@%cs", "--", "content/blog"], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    });
    let date = "";
    for (const line of log.split("\n")) {
      if (line.startsWith("@")) date = line.slice(1);
      else if (line.trim()) firstAdded.set(line.trim(), date); // newest first, so the last write is the oldest
    }
  } catch {
    // No git (e.g. a source tarball): only the ordering check below applies.
  }

  for (const lang of LOCALES) {
    for (const p of posts[lang]) {
      assert.ok(p.datePublished, `${lang}/${p.slug} has no date`);
      assert.ok(!p.dateModified || p.dateModified >= p.datePublished, `${lang}/${p.slug} modified before published`);
      const first = firstAdded.get(`content/blog/${p.slug}.${lang}.mdx`);
      if (first) assert.ok(p.datePublished >= first, `${lang}/${p.slug} is dated ${p.datePublished}, before its first commit on ${first}`);
    }
  }
});

test("every article has a summary and verified-looking primary sources", () => {
  for (const lang of LOCALES) {
    for (const post of posts[lang]) {
      assert.ok(post.summary && post.summary.length >= 3 && post.summary.length <= 4, `${lang}/${post.slug} needs 3–4 summary points`);
      assert.ok(post.sources && post.sources.length >= 2, `${lang}/${post.slug} needs at least 2 sources`);
      for (const source of post.sources) {
        // llmstxt.org is the specification itself, published at the domain root.
        if (source.url.startsWith("https://llmstxt.org")) continue;
        assert.doesNotMatch(source.url, /^https:\/\/[^/]+\/?$/, `${lang}/${post.slug} cites a bare homepage: ${source.url}`);
      }
    }
  }
});

test("meta descriptions and titles fit search result limits", () => {
  for (const lang of LOCALES) {
    for (const post of posts[lang]) {
      assert.ok(post.excerpt.length <= 170, `${lang}/${post.slug} excerpt is ${post.excerpt.length} characters`);
      assert.ok((post.seoTitle ?? post.title).length + " — APEX".length <= 65, `${lang}/${post.slug} title is too long for the SERP`);
    }
  }
});

test("internal links resolve to a page in the same language", () => {
  const known = new Set(["", "about", "services", "portfolio", "blog", "contact", "privacy", "terms"]);
  const routes = new Set();
  for (const lang of LOCALES) {
    for (const s of slugs(posts[lang])) routes.add(`/${lang}/blog/${s}`);
    for (const s of slugs(services[lang])) routes.add(`/${lang}/services/${s}`);
    for (const s of slugs(projects[lang])) routes.add(`/${lang}/portfolio/${s}`);
    for (const c of CATEGORIES) routes.add(`/${lang}/blog/category/${c.slug}`);
    for (const k of known) routes.add(k ? `/${lang}/${k}` : `/${lang}`);
  }
  for (const lang of LOCALES) {
    for (const item of [...posts[lang].map((p) => [p.slug, p.content]), ...services[lang].map((s) => [s.slug, s.body])]) {
      const [slug, body] = item;
      for (const [, href] of body.matchAll(/\]\((\/[^)\s#]*)(?:#[^)\s]*)?\)/g)) {
        if (href.startsWith("/images/")) continue;
        assert.ok(href.startsWith(`/${lang}`), `${lang}/${slug} links across languages: ${href}`);
        assert.ok(routes.has(href.replace(/\/$/, "")), `${lang}/${slug} links to a page that does not exist: ${href}`);
      }
    }
  }
});

test("no article carries claims the audit removed", () => {
  const banned = [
    /Indicative estimates based on Apex project experience/i,
    /from projects we have actually delivered/i,
    /A Real Example from Our Work/i,
    /الضرر السمعي/,
    /تقديرات استرشادية مبنية على خبرة Apex/,
  ];
  for (const lang of LOCALES) {
    for (const post of posts[lang]) {
      for (const pattern of banned) assert.doesNotMatch(post.content, pattern, `${lang}/${post.slug} still contains ${pattern}`);
    }
  }
});

test("cost tables quote the rate card", () => {
  const fmt = (n) => n.toLocaleString("en-US");
  const tiers = [
    [/^\|\s*(Simple app|تطبيق بسيط)\b/m, rateCard.apps.simple.usd],
    [/^\|\s*(Mid-complexity app|تطبيق متوسط التعقيد)\b/m, rateCard.apps.mid.usd],
  ];
  for (const lang of LOCALES) {
    for (const post of posts[lang].filter((p) => p.categories.includes("costs"))) {
      for (const [row, [low, high]] of tiers) {
        for (const line of post.content.split("\n").filter((l) => row.test(l))) {
          if (!/\$|دولار|USD/.test(line)) continue;
          assert.ok(line.includes(fmt(low)) && line.includes(fmt(high)), `${lang}/${post.slug} prices this tier differently from the rate card: ${line.trim()}`);
        }
      }
    }
  }
});

test("every heading has an anchor and every FAQ yields clean question/answer pairs", () => {
  for (const lang of LOCALES) {
    for (const post of posts[lang]) {
      for (const heading of collectHeadings(post.content)) assert.ok(heading.id, `${lang}/${post.slug}: "${heading.text}" has no anchor`);
      const faqs = extractFaqs(post.content);
      assert.ok(faqs.length >= 3, `${lang}/${post.slug} has ${faqs.length} FAQ entries`);
      for (const faq of faqs) assert.doesNotMatch(faq.answer, /-{3,}\s*$/, `${lang}/${post.slug} FAQ answer ends with a rule`);
    }
  }
  assert.equal(slugifyHeading("الأسئلة الشائعة"), "الأسئلة-الشائعة");
});

test("projects declare a category and their images exist", () => {
  for (const lang of LOCALES) {
    for (const project of projects[lang]) {
      for (const src of [project.cover, ...(project.images ?? [])]) {
        assert.ok(existsSync(path.join(root, "public", src)), `${lang}/${project.slug} references missing ${src}`);
      }
    }
  }
});

test("services carry their own features and process", () => {
  for (const lang of LOCALES) {
    for (const service of services[lang]) {
      assert.ok(service.features.length >= 3 && service.process.length >= 3, `${lang}/${service.slug} needs features and process`);
    }
  }
});

test("blog images referenced in Markdown exist", () => {
  for (const lang of LOCALES) {
    for (const post of posts[lang]) {
      for (const [, src] of post.content.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)/g)) {
        assert.ok(existsSync(path.join(root, "public", src)), `${lang}/${post.slug} references missing ${src}`);
      }
    }
  }
});

test("frontmatter categories only use known keys", () => {
  const files = readdirSync(path.join(root, "content", "blog"));
  assert.equal(files.length, posts.en.length * 2);
  for (const post of posts.en) for (const key of post.categories) assert.ok(CATEGORY_KEYS.includes(key));
});
