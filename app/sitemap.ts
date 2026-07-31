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
  { route: "academy", changeFrequency: "monthly", priority: 0.8 },
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

  for (const locale of SUPPORTED_LOCALES) {
    for (const service of serviceMap.get(locale) ?? []) {
      entries.push(
        buildLocalizedEntry(
          {
            en: `/en/services/${service.slug}`,
            ar: `/ar/services/${service.slug}`,
          },
          "monthly",
          0.7,
          service.updatedAt
        )
      );
    }

    for (const post of postMap.get(locale) ?? []) {
      entries.push(
        buildLocalizedEntry(
          {
            en: `/en/blog/${post.slug}`,
            ar: `/ar/blog/${post.slug}`,
          },
          "weekly",
          0.7,
          post.dateModified
            ? new Date(post.dateModified)
            : post.datePublished
              ? new Date(post.datePublished)
              : post.updatedAt
        )
      );
    }

    for (const item of portfolioMap.get(locale) ?? []) {
      entries.push(
        buildLocalizedEntry(
          {
            en: `/en/portfolio/${item.slug}`,
            ar: `/ar/portfolio/${item.slug}`,
          },
          "monthly",
          0.7,
          item.updatedAt
        )
      );
    }

    for (const course of courseMap.get(locale) ?? []) {
      entries.push(
        buildLocalizedEntry(
          {
            en: `/en/academy/${course.slug}`,
            ar: `/ar/academy/${course.slug}`,
          },
          "monthly",
          0.7,
          course.updatedAt
        )
      );

      for (const lesson of course.lessons) {
        entries.push(
          buildLocalizedEntry(
            {
              en: `/en/academy/${course.slug}/${lesson.slug}`,
              ar: `/ar/academy/${course.slug}/${lesson.slug}`,
            },
            "monthly",
            0.6,
            lesson.updatedAt
          )
        );
      }
    }
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
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ route, changeFrequency, priority }) =>
    buildLocalizedEntry(buildPathByLocale(route), changeFrequency, priority, newestContent)
  );

  return [...staticEntries, ...dynamicEntries];
}
