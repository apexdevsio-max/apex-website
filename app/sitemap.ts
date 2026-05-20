import type { MetadataRoute } from "next";

import {
  getAcademyCourses,
  getBlogPosts,
  getPortfolioItems,
  getServices,
} from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locale";
import { siteUrl } from "@/lib/seo/metadata";

type StaticRoute = {
  route: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
  lastModified?: Date;
};

const LAST_UPDATED = new Date("2026-05-17");

const STATIC_ROUTES: StaticRoute[] = [
  { route: "", changeFrequency: "weekly", priority: 1.0, lastModified: LAST_UPDATED },
  { route: "portfolio", changeFrequency: "monthly", priority: 0.8, lastModified: LAST_UPDATED },
  { route: "blog", changeFrequency: "weekly", priority: 0.8, lastModified: LAST_UPDATED },
  { route: "academy", changeFrequency: "monthly", priority: 0.8, lastModified: LAST_UPDATED },
  { route: "contact", changeFrequency: "monthly", priority: 0.7, lastModified: LAST_UPDATED },
  { route: "privacy", changeFrequency: "yearly", priority: 0.3, lastModified: LAST_UPDATED },
  { route: "terms", changeFrequency: "yearly", priority: 0.3, lastModified: LAST_UPDATED },
];

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
    url: `${siteUrl}${pathByLocale.en}`,
    ...(lastModified ? { lastModified: lastModified.toISOString() } : {}),
    changeFrequency,
    priority,
    alternates: {
      languages: {
        ...languages,
        "x-default": languages.en,
      },
    },
  };
}

async function loadDynamicEntries(): Promise<MetadataRoute.Sitemap> {
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
          post.updatedAt
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

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ route, changeFrequency, priority, lastModified }) =>
    buildLocalizedEntry(buildPathByLocale(route), changeFrequency, priority, lastModified)
  );

  const dynamicEntries = await loadDynamicEntries();

  return [...staticEntries, ...dynamicEntries];
}
