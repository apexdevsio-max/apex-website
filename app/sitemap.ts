import type { MetadataRoute } from "next";

import {
  getAcademyCourses,
  getBlogPosts,
  getPortfolioItems,
  getServices,
} from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { siteUrl } from "@/lib/seo/metadata";
import { CATEGORIES, getPostCategoryKeys } from "@/lib/content/taxonomy";

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

/**
 * One sitemap entry per locale, each self-canonical and carrying the full set of
 * hreflang alternates.
 *
 * This used to emit a single entry for the default locale and rely on the
 * `alternates.languages` annotation to lead crawlers to the other one. That is a
 * pattern Google documents, but it left every Arabic URL absent from `<loc>`: the
 * sitemap advertised 89 English pages and zero Arabic ones, so the Arabic half of
 * the site was discoverable only by crawling internal links. Search Console
 * reported it exactly that way, classifying no page at all as "alternate page
 * with proper canonical tag".
 *
 * Listing both is explicitly allowed and is not duplicate content: each page
 * already serves a self-referential canonical, and the reciprocal hreflang set is
 * what tells Google these are translations of one another. The annotations are
 * repeated on every entry because hreflang is only honoured when it is
 * reciprocal.
 */
function buildLocalizedEntries(
  pathByLocale: Record<Locale, string>,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>,
  priority: number,
  lastModified?: Date
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, `${siteUrl}${pathByLocale[locale]}`])
  ) as Record<Locale, string> & { "x-default"?: string };

  const alternates = {
    languages: {
      ...languages,
      // x-default is the fallback for a visitor matching neither locale, not a
      // third version of the page.
      "x-default": languages[DEFAULT_LOCALE],
    },
  };

  return SUPPORTED_LOCALES.map((locale) => ({
    url: `${siteUrl}${pathByLocale[locale]}`,
    ...(lastModified ? { lastModified: lastModified.toISOString() } : {}),
    changeFrequency,
    priority,
    alternates,
  }));
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
      entries.push(
        ...buildLocalizedEntries(pathByLocale, changeFrequency, priority, lastModified)
      );
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
  //   entries.push(...buildLocalizedEntries(pathByLocale, "monthly", 0.6, lastModified));
  // }

  // Blog category landing pages. These are indexable topic hubs, so they belong
  // in the sitemap; the /page/<n> routes under them are noindex and deliberately
  // left out. `lastModified` uses the newest article in each category, since a
  // category page changes exactly when one of its articles does.
  const newestPostByCategory = new Map<string, Date>();
  for (const locale of SUPPORTED_LOCALES) {
    for (const post of postMap.get(locale) ?? []) {
      const modified = post.dateModified
        ? new Date(post.dateModified)
        : post.datePublished
          ? new Date(post.datePublished)
          : post.updatedAt;
      if (!modified) continue;
      for (const key of getPostCategoryKeys(post.slug)) {
        const existing = newestPostByCategory.get(key);
        if (!existing || modified > existing) newestPostByCategory.set(key, modified);
      }
    }
  }

  for (const category of CATEGORIES) {
    entries.push(
      ...buildLocalizedEntries(
        buildPathByLocale(`blog/category/${category.slug}`),
        "weekly",
        0.6,
        newestPostByCategory.get(category.key)
      )
    );
  }

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
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap(
    ({ route, changeFrequency, priority }) =>
      buildLocalizedEntries(buildPathByLocale(route), changeFrequency, priority, newestContent)
  );

  return [...staticEntries, ...dynamicEntries];
}
