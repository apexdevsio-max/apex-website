import "server-only";
import type { Locale } from "@/lib/i18n/locale";
import path from "path";
import { readdir, readFile, stat } from "fs/promises";

export type ServiceItem = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  ctaLabel: string;
  updatedAt?: Date;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  updatedAt?: Date;
};

export type PortfolioItem = {
  slug: string;
  title: string;
  summary: string;
  description: string;
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

function assertServiceItem(value: unknown, index: number, dataset: string): asserts value is ServiceItem {
  if (!isRecord(value)) throw new Error(`Invalid ${dataset}: item[${index}] must be an object`);
  assertString(value.slug, `item[${index}].slug`, dataset);
  assertString(value.title, `item[${index}].title`, dataset);
  assertString(value.summary, `item[${index}].summary`, dataset);
  assertString(value.description, `item[${index}].description`, dataset);
  assertString(value.ctaLabel, `item[${index}].ctaLabel`, dataset);
}

function assertBlogPost(value: unknown, index: number, dataset: string): asserts value is BlogPost {
  if (!isRecord(value)) throw new Error(`Invalid ${dataset}: item[${index}] must be an object`);
  assertString(value.slug, `item[${index}].slug`, dataset);
  assertString(value.title, `item[${index}].title`, dataset);
  assertString(value.excerpt, `item[${index}].excerpt`, dataset);
  assertString(value.content, `item[${index}].content`, dataset);
}

function assertPortfolioItem(value: unknown, index: number, dataset: string): asserts value is PortfolioItem {
  if (!isRecord(value)) throw new Error(`Invalid ${dataset}: item[${index}] must be an object`);
  assertString(value.slug, `item[${index}].slug`, dataset);
  assertString(value.title, `item[${index}].title`, dataset);
  assertString(value.summary, `item[${index}].summary`, dataset);
  assertString(value.description, `item[${index}].description`, dataset);
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
  assertString(value.slug, `item[${courseIndex}].lessons[${lessonIndex}].slug`, dataset);
  assertString(value.title, `item[${courseIndex}].lessons[${lessonIndex}].title`, dataset);
  assertString(value.summary, `item[${courseIndex}].lessons[${lessonIndex}].summary`, dataset);
  assertString(value.content, `item[${courseIndex}].lessons[${lessonIndex}].content`, dataset);
}

function assertAcademyCourse(value: unknown, index: number, dataset: string): asserts value is AcademyCourse {
  if (!isRecord(value)) throw new Error(`Invalid ${dataset}: item[${index}] must be an object`);
  assertString(value.slug, `item[${index}].slug`, dataset);
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
  const files = await readLocalizedMdxFiles(directory, locale);

  const items = await Promise.all(
    files.map(async (fileName) => {
      const filePath = path.join(directory, fileName);
      const { data, body, updatedAt } = await readMdxFile(filePath);
      const slugFromName = fileName.replace(`.${locale}.mdx`, "");

      return {
        slug: (data.slug as string) ?? slugFromName,
        title: data.title as string,
        excerpt: data.excerpt as string,
        content: body,
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

      return {
        slug: (data.slug as string) ?? slugFromName,
        title: data.title as string,
        summary: data.summary as string,
        description: (data.description as string) ?? body,
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
        summary: data.summary as string,
        description: (data.description as string) ?? body,
        ctaLabel: data.ctaLabel as string,
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

export async function getServices(locale: Locale): Promise<ServiceItem[]> {
  return loadServices(locale);
}

export async function getServiceBySlug(
  locale: Locale,
  slug: string
): Promise<ServiceItem | undefined> {
  const items = await getServices(locale);
  return items.find((item) => item.slug === slug);
}

export async function getBlogPosts(locale: Locale): Promise<BlogPost[]> {
  return loadBlogPosts(locale);
}

export async function getBlogPostBySlug(
  locale: Locale,
  slug: string
): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts(locale);
  return posts.find((post) => post.slug === slug);
}

export async function getPortfolioItems(locale: Locale): Promise<PortfolioItem[]> {
  return loadPortfolioItems(locale);
}

export async function getPortfolioItemBySlug(
  locale: Locale,
  slug: string
): Promise<PortfolioItem | undefined> {
  const items = await getPortfolioItems(locale);
  return items.find((item) => item.slug === slug);
}

export async function getAcademyCourses(locale: Locale): Promise<AcademyCourse[]> {
  return loadAcademyCourses(locale);
}

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
