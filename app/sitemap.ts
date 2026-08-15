import type { MetadataRoute } from "next";

import {
  getAcademyCourses,
  getBlogPosts,
  getPortfolioItems,
  getServices,
} from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { siteUrl } from "@/lib/seo/metadata";

type StaticRoute = {
  route: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
  lastModified?: Date;
};

const STATIC_ROUTES: Array<Omit<StaticRoute, "lastModified">> = [
  { route: "", changeFrequency: "weekly", priority: 1.0 },
  { route: "about", changeFrequency: "monthly", priority: 0.8 },
  { route: "services", changeFrequency: "monthly", priority: 0.8 },
  { route: "portfolio", changeFrequency: "monthly", priority: 0.8 },
  { route: "blog", changeFrequency: "weekly", priority: 0.8 },
  // Academy is hidden for now, so it is kept out of the sitemap to avoid
  // advertising pages the navigation no longer links to. See data/navigation.ts.
  // { route: "academy", changeFrequency: "monthly", priority: 0.8 },
  { route: "contact", changeFrequency: "monthly", priority: 0.7 },
  { route: "privacy", changeFrequency: "yearly", priority: 0.3 },
  { route: "terms", changeFrequency: "yearly", priority: 0.3 },
];

/**
 * Newest modification time across all content, used as `lastModified` for the
 * listing/static routes. Previously a hardcoded date, which drifted months behind
 * reality and told crawlers the site was staler than it was.
 */
function newestContentDate(collections: Array<Array<{ updatedAt?: Date }>>): Date | undefined {
  let newest: Date | undefined;
  for (const items of collections) {
    for (const { updatedAt } of items) {
      if (updatedAt && (!newest || updatedAt > newest)) newest = updatedAt;
    }
  }
  return newest;
}

function buildPathByLocale(route: string): Record<Locale, string> {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [
      locale,
      route ? `/${locale}/${route}` : `/${locale}`,
    ])
  ) as Record<Locale, string>;
}

function buildLocalizedEntry(
  pathByLocale: Record<Locale, string>,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>,
  priority: number,
  lastModified?: Date
): MetadataRoute.Sitemap[number] {
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, `${siteUrl}${pathByLocale[locale]}`])
  ) as Record<Locale, string> & { "x-default"?: string };

  return {
    url: `${siteUrl}${pathByLocale[DEFAULT_LOCALE]}`,
    ...(lastModified ? { lastModified: lastModified.toISOString() } : {}),
    changeFrequency,
    priority,
    alternates: {
      languages: {
        ...languages,
        "x-default": languages[DEFAULT_LOCALE],
      },
    },
  };
}

async function loadDynamicEntries(): Promise<{ entries: MetadataRoute.Sitemap; newestContent?: Date }> {
  const [servicesByLocale, postsByLocale, portfolioByLocale, coursesByLocale] =
    await Promise.all([
      Promise.all(
        SUPPORTED_LOCALES.map(async (locale) => ({
          locale,
          items: await getServices(locale),
        }))
      ),
      Promise.all(
        SUPPORTED_LOCALES.map(async (locale) => ({
          locale,
          items: await getBlogPosts(locale),
        }))
      ),
      Promise.all(
        SUPPORTED_LOCALES.map(async (locale) => ({
          locale,
          items: await getPortfolioItems(locale),
        }))
      ),
      Promise.all(
        SUPPORTED_LOCALES.map(async (locale) => ({
          locale,
          items: await getAcademyCourses(locale),
        }))
      ),
    ]);

  const serviceMap = new Map(
    servicesByLocale.map(({ locale, items }) => [locale, items] as const)
  );
  const postMap = new Map(
    postsByLocale.map(({ locale, items }) => [locale, items] as const)
  );
  const portfolioMap = new Map(
    portfolioByLocale.map(({ locale, items }) => [locale, items] as const)
  );
  const courseMap = new Map(
    coursesByLocale.map(({ locale, items }) => [locale, items] as const)
  );

  const entries: MetadataRoute.Sitemap = [];

  // One entry per piece of content, NOT one per locale. Each entry already carries
  // both locales in its `alternates.languages`, so iterating SUPPORTED_LOCALES here
  // emitted every URL twice (67 entries for 38 unique URLs) while `<loc>` stayed
  // pinned to DEFAULT_LOCALE — so no /ar/ URL was ever listed. Locale coverage comes
  // from the hreflang alternates below, which mergeLocaleSlugs preserves.
  //
  // Slugs are keyed by locale because a translated item may carry its own slug; the
  // union below keeps an item listed even if it exists in only one language.
  const localeSlugs = <T extends { slug: string }>(
    map: Map<Locale, T[]>,
    select: (item: T) => Date | undefined
  ) => {
    const merged = new Map<string, { lastModified?: Date }>();
    for (const locale of SUPPORTED_LOCALES) {
      for (const item of map.get(locale) ?? []) {
        const lastModified = select(item);
        const existing = merged.get(item.slug);
        if (existing) {
          if (lastModified && (!existing.lastModified || lastModified > existing.lastModified)) {
            existing.lastModified = lastModified;
          }
          continue;
        }
        merged.set(item.slug, { lastModified });
      }
    }
    return merged;
  };

  const pushCollection = <T extends { slug: string }>(
    map: Map<Locale, T[]>,
    toPath: (locale: Locale, slug: string) => string,
    changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>,
    priority: number,
    select: (item: T) => Date | undefined
  ) => {
    for (const [slug, { lastModified }] of localeSlugs(map, select)) {
      const pathByLocale = Object.fromEntries(
        SUPPORTED_LOCALES.map((locale) => [locale, toPath(locale, slug)])
      ) as Record<Locale, string>;
      entries.push(buildLocalizedEntry(pathByLocale, changeFrequency, priority, lastModified));
    }
  };

  pushCollection(
    serviceMap,
    (locale, slug) => `/${locale}/services/${slug}`,
    "monthly",
    0.7,
    (service) => service.updatedAt
  );

  pushCollection(
    postMap,
    (locale, slug) => `/${locale}/blog/${slug}`,
    "weekly",
    0.7,
    (post) =>
      post.dateModified
        ? new Date(post.dateModified)
        : post.datePublished
          ? new Date(post.datePublished)
          : post.updatedAt
  );

  pushCollection(
    portfolioMap,
    (locale, slug) => `/${locale}/portfolio/${slug}`,
    "monthly",
    0.7,
    (item) => item.updatedAt
  );

  // Academy course URLs are withheld while the section is hidden.
  // pushCollection(
  //   courseMap,
  //   (locale, slug) => `/${locale}/academy/${slug}`,
  //   "monthly",
  //   0.7,
  //   (course) => course.updatedAt
  // );

  // Lessons are nested, so they need the course slug as well as their own.
  const lessonEntries = new Map<string, { course: string; lesson: string; lastModified?: Date }>();
  for (const locale of SUPPORTED_LOCALES) {
    for (const course of courseMap.get(locale) ?? []) {
      for (const lesson of course.lessons) {
        const key = `${course.slug}/${lesson.slug}`;
        const existing = lessonEntries.get(key);
        if (existing) {
          if (lesson.updatedAt && (!existing.lastModified || lesson.updatedAt > existing.lastModified)) {
            existing.lastModified = lesson.updatedAt;
          }
          continue;
        }
        lessonEntries.set(key, {
          course: course.slug,
          lesson: lesson.slug,
          lastModified: lesson.updatedAt,
        });
      }
    }
  }

  // Academy lesson URLs are withheld while the section is hidden. lessonEntries
  // above is still built so re-enabling is a matter of uncommenting this loop.
  // for (const { course, lesson, lastModified } of lessonEntries.values()) {
  //   const pathByLocale = Object.fromEntries(
  //     SUPPORTED_LOCALES.map((locale) => [locale, `/${locale}/academy/${course}/${lesson}`])
  //   ) as Record<Locale, string>;
  //   entries.push(buildLocalizedEntry(pathByLocale, "monthly", 0.6, lastModified));
  // }

  const newestContent = newestContentDate([
    ...servicesByLocale.map(({ items }) => items),
    ...postsByLocale.map(({ items }) => items),
    ...portfolioByLocale.map(({ items }) => items),
    ...coursesByLocale.map(({ items }) => items),
    ...coursesByLocale.flatMap(({ items }) => items.map((course) => course.lessons)),
  ]);

  return { entries, newestContent };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { entries: dynamicEntries, newestContent } = await loadDynamicEntries();

  // Listing pages change whenever any of the content they list changes, so they
  // inherit the newest content timestamp rather than a fixed date.
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ route, changeFrequency, priority }) =>
    buildLocalizedEntry(buildPathByLocale(route), changeFrequency, priority, newestContent)
  );

  return [...staticEntries, ...dynamicEntries];
}
