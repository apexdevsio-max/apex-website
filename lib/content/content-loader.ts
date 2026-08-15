import "server-only";
import { cache } from "react";
import type { Locale } from "@/lib/i18n/locale";
import path from "path";
import { readdir, readFile, stat } from "fs/promises";

export type ServiceFaq = {
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
  updatedAt?: Date;
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
  datePublished?: string;
  dateModified?: string;
  updatedAt?: Date;
};

export type PortfolioItem = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  thumbnail?: string;
  images?: string[];
  driveUrl?: string;
  updatedAt?: Date;
};

export type AcademyLesson = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  updatedAt?: Date;
};

export type AcademyCourse = {
  slug: string;
  title: string;
  summary: string;
  lessons: AcademyLesson[];
  updatedAt?: Date;
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
}

function assertPortfolioItem(value: unknown, index: number, dataset: string): asserts value is PortfolioItem {
  if (!isRecord(value)) throw new Error(`Invalid ${dataset}: item[${index}] must be an object`);
  assertSlug(value.slug, `item[${index}].slug`, dataset);
  assertString(value.title, `item[${index}].title`, dataset);
  assertString(value.summary, `item[${index}].summary`, dataset);
  assertString(value.description, `item[${index}].description`, dataset);
  if (value.thumbnail !== undefined) assertString(value.thumbnail, `item[${index}].thumbnail`, dataset);
  if (value.driveUrl !== undefined) assertString(value.driveUrl, `item[${index}].driveUrl`, dataset);
  assertOptionalStringArray(value.images, `item[${index}].images`, dataset);
}

function assertAcademyLesson(
  value: unknown,
  courseIndex: number,
  lessonIndex: number,
  dataset: string
): asserts value is AcademyLesson {
  if (!isRecord(value)) {
    throw new Error(`Invalid ${dataset}: item[${courseIndex}].lessons[${lessonIndex}] must be an object`);
  }
  assertSlug(value.slug, `item[${courseIndex}].lessons[${lessonIndex}].slug`, dataset);
  assertString(value.title, `item[${courseIndex}].lessons[${lessonIndex}].title`, dataset);
  assertString(value.summary, `item[${courseIndex}].lessons[${lessonIndex}].summary`, dataset);
  assertString(value.content, `item[${courseIndex}].lessons[${lessonIndex}].content`, dataset);
}

function assertAcademyCourse(value: unknown, index: number, dataset: string): asserts value is AcademyCourse {
  if (!isRecord(value)) throw new Error(`Invalid ${dataset}: item[${index}] must be an object`);
  assertSlug(value.slug, `item[${index}].slug`, dataset);
  assertString(value.title, `item[${index}].title`, dataset);
  assertString(value.summary, `item[${index}].summary`, dataset);

  if (!Array.isArray(value.lessons)) {
    throw new Error(`Invalid ${dataset}: item[${index}].lessons must be an array`);
  }

  value.lessons.forEach((lesson, lessonIndex) =>
    assertAcademyLesson(lesson, index, lessonIndex, dataset)
  );
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

async function readMdxFile(filePath: string): Promise<{ data: Frontmatter; body: string; updatedAt?: Date }> {
  const [source, info] = await Promise.all([readFile(filePath, "utf8"), stat(filePath)]);
  const { data, body } = parseFrontmatter(source, filePath);
  return { data, body, updatedAt: info?.mtime };
}

async function directoryExists(directory: string): Promise<boolean> {
  try {
    const info = await stat(directory);
    return info.isDirectory();
  } catch {
    return false;
  }
}

async function loadBlogPosts(locale: Locale): Promise<BlogPost[]> {
  const directory = path.join(CONTENT_ROOT, "blog");
  if (!(await directoryExists(directory))) return [];
  const files = await readLocalizedMdxFiles(directory, locale);

  const items = await Promise.all(
    files.map(async (fileName) => {
      const filePath = path.join(directory, fileName);
      const { data, body, updatedAt } = await readMdxFile(filePath);
      const slugFromName = fileName.replace(`.${locale}.mdx`, "");

      return {
        slug: (data.slug as string) ?? slugFromName,
        title: data.title as string,
        seoTitle: data.seoTitle as string | undefined,
        excerpt: data.excerpt as string,
        content: body,
        datePublished: optionalIsoDate(data.datePublished ?? data.date, "datePublished", `blog.${locale}`),
        dateModified: optionalIsoDate(data.dateModified, "dateModified", `blog.${locale}`),
        updatedAt,
      } satisfies BlogPost;
    })
  );

  assertArray<BlogPost>(items, `blog.${locale}`, assertBlogPost);
  return items;
}

async function loadPortfolioItems(locale: Locale): Promise<PortfolioItem[]> {
  const directory = path.join(CONTENT_ROOT, "projects");
  const files = await readLocalizedMdxFiles(directory, locale);

  const items = await Promise.all(
    files.map(async (fileName) => {
      const filePath = path.join(directory, fileName);
      const { data, body, updatedAt } = await readMdxFile(filePath);
      const slugFromName = fileName.replace(`.${locale}.mdx`, "");

      // Frontmatter `description` holds the bullet summary; the MDX body holds the
      // long-form case study. Previously the body was only a fallback, so a file
      // carrying both rendered the bullets alone and the case study never
      // appeared — leaving these pages at ~180 words. Both are joined here.
      const frontmatterDescription = data.description as string | undefined;
      const description = [frontmatterDescription, body]
        .filter((part): part is string => Boolean(part && part.trim()))
        .join("\n\n");

      return {
        slug: (data.slug as string) ?? slugFromName,
        title: data.title as string,
        summary: data.summary as string,
        description,
        thumbnail: data.thumbnail as string | undefined,
        images: data.images as string[] | undefined,
        driveUrl: data.driveUrl as string | undefined,
        updatedAt,
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
      const { data, body, updatedAt } = await readMdxFile(filePath);
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
        updatedAt,
      } satisfies ServiceItem;
    })
  );

  assertArray<ServiceItem>(items, `services.${locale}`, assertServiceItem);
  return items;
}

async function loadAcademyCourses(locale: Locale): Promise<AcademyCourse[]> {
  const directory = path.join(CONTENT_ROOT, "courses");
  const files = await readLocalizedMdxFiles(directory, locale);

  const courses = await Promise.all(
    files.map(async (fileName) => {
      const filePath = path.join(directory, fileName);
      const { data, updatedAt } = await readMdxFile(filePath);
      const slugFromName = fileName.replace(`.${locale}.mdx`, "");
      const courseSlug = (data.slug as string) ?? slugFromName;

      const lessonsDir = path.join(directory, courseSlug);
      const lessons = (await directoryExists(lessonsDir))
        ? await Promise.all(
            (await readLocalizedMdxFiles(lessonsDir, locale)).map(async (lessonFile) => {
              const lessonPath = path.join(lessonsDir, lessonFile);
              const { data: lessonData, body: lessonBody, updatedAt: lessonUpdatedAt } =
                await readMdxFile(lessonPath);
              const lessonSlugFromName = lessonFile.replace(`.${locale}.mdx`, "");

              return {
                slug: (lessonData.slug as string) ?? lessonSlugFromName,
                title: lessonData.title as string,
                summary: lessonData.summary as string,
                content: lessonBody,
                updatedAt: lessonUpdatedAt,
              } satisfies AcademyLesson;
            })
          )
        : [];

      return {
        slug: courseSlug,
        title: data.title as string,
        summary: data.summary as string,
        lessons,
        updatedAt,
      } satisfies AcademyCourse;
    })
  );

  assertArray<AcademyCourse>(courses, `academy.${locale}`, assertAcademyCourse);
  return courses;
}

// Each of these reads and validates a whole content directory. `cache()` dedupes
// that work per render pass, which matters because the *BySlug helpers below load
// the full collection to find one item, and generateStaticParams +
// generateMetadata + the page body all request the same data while building
// ~157 routes.
export const getServices = cache(async (locale: Locale): Promise<ServiceItem[]> => {
  return loadServices(locale);
});

export async function getServiceBySlug(
  locale: Locale,
  slug: string
): Promise<ServiceItem | undefined> {
  const items = await getServices(locale);
  return items.find((item) => item.slug === slug);
}

export const getBlogPosts = cache(async (locale: Locale): Promise<BlogPost[]> => {
  return loadBlogPosts(locale);
});

export async function getBlogPostBySlug(
  locale: Locale,
  slug: string
): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts(locale);
  return posts.find((post) => post.slug === slug);
}

export const getPortfolioItems = cache(async (locale: Locale): Promise<PortfolioItem[]> => {
  return loadPortfolioItems(locale);
});

export async function getPortfolioItemBySlug(
  locale: Locale,
  slug: string
): Promise<PortfolioItem | undefined> {
  const items = await getPortfolioItems(locale);
  return items.find((item) => item.slug === slug);
}

export const getAcademyCourses = cache(async (locale: Locale): Promise<AcademyCourse[]> => {
  return loadAcademyCourses(locale);
});

export async function getAcademyCourseBySlug(
  locale: Locale,
  slug: string
): Promise<AcademyCourse | undefined> {
  const courses = await getAcademyCourses(locale);
  return courses.find((course) => course.slug === slug);
}

export async function getAcademyLessonBySlugs(
  locale: Locale,
  courseSlug: string,
  lessonSlug: string
): Promise<{ course: AcademyCourse; lesson: AcademyLesson } | undefined> {
  const course = await getAcademyCourseBySlug(locale, courseSlug);
  if (!course) return undefined;
  const lesson = course.lessons.find((item) => item.slug === lessonSlug);
  if (!lesson) return undefined;
  return { course, lesson };
}
