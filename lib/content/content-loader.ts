import "server-only";
import { cache } from "react";
import type { Locale } from "@/lib/i18n/locale";
import path from "path";
import { readdir, readFile, stat } from "fs/promises";

import { CATEGORY_KEYS, isCategoryKey, type CategoryKey } from "@/lib/content/taxonomy";

type ServiceFaq = {
  question: string;
  answer: string;
};

export type ServiceItem = {
  slug: string;
  title: string;
  /** Optional shorter/longer `<title>` override. See {@link BlogPost.seoTitle}. */
  seoTitle?: string;
  summary: string;
  description: string;
  ctaLabel: string;
  /** Long-form markdown body. Empty when a service has only frontmatter. */
  body: string;
  /** Rendered on the page and emitted as FAQPage JSON-LD for rich results. */
  faq: ServiceFaq[];
  keywords?: string[];
  /** What the engagement includes, shown as a checklist. */
  features: string[];
  /** Delivery steps, shown in order. */
  process: string[];
  dateModified?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  /**
   * Optional shorter title for the `<title>` tag. The on-page H1 can afford to be
   * descriptive, but the SERP truncates around 60 characters — and the layout
   * template appends " — APEX" to whatever is returned. Set this when `title`
   * plus the suffix would overflow; metadata falls back to `title` when absent.
   */
  seoTitle?: string;
  excerpt: string;
  content: string;
  /** First entry is the primary category. */
  categories: CategoryKey[];
  keywords?: string[];
  /** Minutes, computed from the body so it can never drift from the text. */
  readTime: number;
  /** Key takeaways shown above the body: the self-contained answers answer engines quote. */
  summary?: string[];
  /** Primary sources the article relies on, listed under the body. */
  sources?: Array<{ title: string; url: string }>;
  datePublished?: string;
  dateModified?: string;
};

export const PROJECT_CATEGORIES = ["app", "ai-content", "video"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export type PortfolioItem = {
  slug: string;
  title: string;
  summary: string;
  category: ProjectCategory;
  /** 16:9 or portrait still used on cards and as the page hero. */
  cover: string;
  description: string;
  images?: string[];
  driveUrl?: string;
  dateModified?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assertString(value: unknown, path: string, dataset: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid ${dataset}: "${path}" must be a non-empty string`);
  }
}

function assertSlug(value: unknown, path: string, dataset: string): asserts value is string {
  assertString(value, path, dataset);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error(`Invalid ${dataset}: "${path}" must be a lowercase URL-safe slug`);
  }
}

function assertStringArray(value: unknown, path: string, dataset: string): asserts value is string[] {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`Invalid ${dataset}: "${path}" must be a non-empty array`);
  assertOptionalStringArray(value, path, dataset);
}

function assertOptionalStringArray(value: unknown, path: string, dataset: string): asserts value is string[] | undefined {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    throw new Error(`Invalid ${dataset}: "${path}" must be an array of non-empty strings`);
  }
}

function optionalIsoDate(value: unknown, path: string, dataset: string): string | undefined {
  if (value === undefined) return undefined;
  assertString(value, path, dataset);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid ${dataset}: "${path}" must be a valid date`);
  return value;
}

function assertServiceFaq(value: unknown, path: string, dataset: string): asserts value is ServiceFaq[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${dataset}: "${path}" must be an array`);
  }
  value.forEach((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(`Invalid ${dataset}: "${path}[${index}]" must be an object`);
    }
    assertString(entry.question, `${path}[${index}].question`, dataset);
    assertString(entry.answer, `${path}[${index}].answer`, dataset);
  });
}

function assertServiceItem(value: unknown, index: number, dataset: string): asserts value is ServiceItem {
  if (!isRecord(value)) throw new Error(`Invalid ${dataset}: item[${index}] must be an object`);
  assertSlug(value.slug, `item[${index}].slug`, dataset);
  assertString(value.title, `item[${index}].title`, dataset);
  assertString(value.summary, `item[${index}].summary`, dataset);
  assertString(value.description, `item[${index}].description`, dataset);
  assertString(value.ctaLabel, `item[${index}].ctaLabel`, dataset);
  assertServiceFaq(value.faq, `item[${index}].faq`, dataset);
  assertOptionalStringArray(value.keywords, `item[${index}].keywords`, dataset);
  assertStringArray(value.features, `item[${index}].features`, dataset);
  assertStringArray(value.process, `item[${index}].process`, dataset);
  if (typeof value.body !== "string") {
    throw new Error(`Invalid ${dataset}: "item[${index}].body" must be a string`);
  }
}

function assertBlogPost(value: unknown, index: number, dataset: string): asserts value is BlogPost {
  if (!isRecord(value)) throw new Error(`Invalid ${dataset}: item[${index}] must be an object`);
  assertSlug(value.slug, `item[${index}].slug`, dataset);
  assertString(value.title, `item[${index}].title`, dataset);
  assertString(value.excerpt, `item[${index}].excerpt`, dataset);
  assertString(value.content, `item[${index}].content`, dataset);
  const categories = value.categories;
  if (!Array.isArray(categories) || categories.length === 0 || !categories.every((c) => typeof c === "string" && isCategoryKey(c))) {
    throw new Error(`Invalid ${dataset}: "item[${index}].categories" must list one or more of ${CATEGORY_KEYS.join(", ")}`);
  }
  assertOptionalStringArray(value.keywords, `item[${index}].keywords`, dataset);
  assertOptionalStringArray(value.summary, `item[${index}].summary`, dataset);
  if (value.sources !== undefined) {
    if (!Array.isArray(value.sources)) throw new Error(`Invalid ${dataset}: "item[${index}].sources" must be an array`);
    value.sources.forEach((source, i) => {
      if (!isRecord(source)) throw new Error(`Invalid ${dataset}: "item[${index}].sources[${i}]" must be an object`);
      assertString(source.title, `item[${index}].sources[${i}].title`, dataset);
      assertString(source.url, `item[${index}].sources[${i}].url`, dataset);
      if (!/^https:\/\//.test(source.url as string)) throw new Error(`Invalid ${dataset}: "item[${index}].sources[${i}].url" must be https`);
    });
  }
}

function assertPortfolioItem(value: unknown, index: number, dataset: string): asserts value is PortfolioItem {
  if (!isRecord(value)) throw new Error(`Invalid ${dataset}: item[${index}] must be an object`);
  assertSlug(value.slug, `item[${index}].slug`, dataset);
  assertString(value.title, `item[${index}].title`, dataset);
  assertString(value.summary, `item[${index}].summary`, dataset);
  assertString(value.description, `item[${index}].description`, dataset);
  assertString(value.cover, `item[${index}].cover`, dataset);
  if (typeof value.category !== "string" || !(PROJECT_CATEGORIES as readonly string[]).includes(value.category)) {
    throw new Error(`Invalid ${dataset}: "item[${index}].category" must be one of ${PROJECT_CATEGORIES.join(", ")}`);
  }
  if (value.driveUrl !== undefined) assertString(value.driveUrl, `item[${index}].driveUrl`, dataset);
  assertOptionalStringArray(value.images, `item[${index}].images`, dataset);
}

function assertArray<T>(
  value: unknown,
  dataset: string,
  assertItem: (item: unknown, index: number, dataset: string) => asserts item is T
): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${dataset}: expected an array`);
  }

  value.forEach((item, index) => assertItem(item, index, dataset));
  const slugs = value.map((item) => (item as { slug?: unknown }).slug).filter((slug): slug is string => typeof slug === "string");
  if (new Set(slugs).size !== slugs.length) throw new Error(`Invalid ${dataset}: duplicate slugs are not allowed`);
}

type Frontmatter = Record<string, unknown>;

const CONTENT_ROOT = path.join(process.cwd(), "content");

function parseFrontmatter(source: string, filePath: string): { data: Frontmatter; body: string } {
  const normalized = source.replace(/^\uFEFF/, "");
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(normalized);
  if (!match) {
    throw new Error(`Invalid frontmatter in ${filePath}: expected JSON frontmatter delimited by ---`);
  }

  const raw = match[1].trim();
  let data: Frontmatter;
  try {
    data = JSON.parse(raw) as Frontmatter;
  } catch (error) {
    throw new Error(`Invalid frontmatter JSON in ${filePath}: ${(error as Error).message}`);
  }

  return { data, body: match[2].trim() };
}

async function readLocalizedMdxFiles(directory: string, locale: Locale): Promise<string[]> {
  const entries = await readdir(directory);
  return entries
    .filter((name) => name.endsWith(`.${locale}.mdx`))
    .sort((a, b) => a.localeCompare(b));
}

async function readMdxFile(filePath: string): Promise<{ data: Frontmatter; body: string }> {
  return parseFrontmatter(await readFile(filePath, "utf8"), filePath);
}

async function directoryExists(directory: string): Promise<boolean> {
  try {
    return (await stat(directory)).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Reading time from the body. Arabic is read more slowly per word than English,
 * and the old hand-maintained values were wrong on 13 articles (`flutter` said 6
 * minutes for ~2,600 words).
 */
function readingMinutes(markdown: string, locale: Locale): number {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`|-]/g, " ");
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / (locale === "ar" ? 180 : 220)));
}

async function loadBlogPosts(locale: Locale): Promise<BlogPost[]> {
  const directory = path.join(CONTENT_ROOT, "blog");
  if (!(await directoryExists(directory))) return [];
  const files = await readLocalizedMdxFiles(directory, locale);

  const items = await Promise.all(
    files.map(async (fileName) => {
      const filePath = path.join(directory, fileName);
      const { data, body } = await readMdxFile(filePath);
      const slugFromName = fileName.replace(`.${locale}.mdx`, "");

      return {
        slug: (data.slug as string) ?? slugFromName,
        title: data.title as string,
        seoTitle: data.seoTitle as string | undefined,
        excerpt: data.excerpt as string,
        content: body,
        categories: data.categories as CategoryKey[],
        keywords: data.keywords as string[] | undefined,
        readTime: readingMinutes(body, locale),
        summary: data.summary as string[] | undefined,
        sources: data.sources as BlogPost["sources"],
        datePublished: optionalIsoDate(data.datePublished ?? data.date, "datePublished", `blog.${locale}`),
        dateModified: optionalIsoDate(data.dateModified, "dateModified", `blog.${locale}`),
      } satisfies BlogPost;
    })
  );

  assertArray<BlogPost>(items, `blog.${locale}`, assertBlogPost);
  // Newest first, which is the order every listing wants.
  return items.sort((a, b) => (b.datePublished ?? "").localeCompare(a.datePublished ?? ""));
}

async function loadPortfolioItems(locale: Locale): Promise<PortfolioItem[]> {
  const directory = path.join(CONTENT_ROOT, "projects");
  const files = await readLocalizedMdxFiles(directory, locale);

  const items = await Promise.all(
    files.map(async (fileName) => {
      const filePath = path.join(directory, fileName);
      const { data, body } = await readMdxFile(filePath);
      const slugFromName = fileName.replace(`.${locale}.mdx`, "");

      // Frontmatter `description` holds the bullet summary and the body the long
      // case study; both are rendered.
      const frontmatterDescription = data.description as string | undefined;
      const description = [frontmatterDescription, body]
        .filter((part): part is string => Boolean(part && part.trim()))
        .join("\n\n");

      return {
        slug: (data.slug as string) ?? slugFromName,
        title: data.title as string,
        summary: data.summary as string,
        category: data.category as ProjectCategory,
        cover: data.cover as string,
        description,
        images: data.images as string[] | undefined,
        driveUrl: data.driveUrl as string | undefined,
        dateModified: optionalIsoDate(data.dateModified, "dateModified", `portfolio.${locale}`),
      } satisfies PortfolioItem;
    })
  );

  assertArray<PortfolioItem>(items, `portfolio.${locale}`, assertPortfolioItem);
  return items;
}

async function loadServices(locale: Locale): Promise<ServiceItem[]> {
  const directory = path.join(CONTENT_ROOT, "services");
  const files = await readLocalizedMdxFiles(directory, locale);

  const items = await Promise.all(
    files.map(async (fileName) => {
      const filePath = path.join(directory, fileName);
      const { data, body } = await readMdxFile(filePath);
      const slugFromName = fileName.replace(`.${locale}.mdx`, "");

      return {
        slug: (data.slug as string) ?? slugFromName,
        title: data.title as string,
        seoTitle: data.seoTitle as string | undefined,
        summary: data.summary as string,
        description: (data.description as string) ?? body,
        ctaLabel: data.ctaLabel as string,
        body,
        faq: (data.faq as ServiceFaq[]) ?? [],
        keywords: data.keywords as string[] | undefined,
        features: data.features as string[],
        process: data.process as string[],
        dateModified: optionalIsoDate(data.dateModified, "dateModified", `services.${locale}`),
      } satisfies ServiceItem;
    })
  );

  assertArray<ServiceItem>(items, `services.${locale}`, assertServiceItem);
  return items;
}

/**
 * Content only changes between deploys, so in production each collection is read
 * once per process. React's `cache()` alone is per-render, which re-read and
 * re-validated every file for each of the ~250 prerendered pages and for every
 * on-demand social card.
 */
function memoize<T>(load: (locale: Locale) => Promise<T>) {
  const store = new Map<Locale, Promise<T>>();
  return cache((locale: Locale): Promise<T> => {
    if (process.env.NODE_ENV !== "production") return load(locale);
    let pending = store.get(locale);
    if (!pending) {
      pending = load(locale);
      pending.catch(() => store.delete(locale));
      store.set(locale, pending);
    }
    return pending;
  });
}

export const getServices = memoize(loadServices);
export const getBlogPosts = memoize(loadBlogPosts);
export const getPortfolioItems = memoize(loadPortfolioItems);

export async function getServiceBySlug(locale: Locale, slug: string): Promise<ServiceItem | undefined> {
  return (await getServices(locale)).find((item) => item.slug === slug);
}

export async function getBlogPostBySlug(locale: Locale, slug: string): Promise<BlogPost | undefined> {
  return (await getBlogPosts(locale)).find((post) => post.slug === slug);
}

export async function getPortfolioItemBySlug(locale: Locale, slug: string): Promise<PortfolioItem | undefined> {
  return (await getPortfolioItems(locale)).find((item) => item.slug === slug);
}
