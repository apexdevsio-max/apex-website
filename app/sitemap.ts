import type { MetadataRoute } from "next";

import {
  getAcademyCourses,
  getBlogPosts,
  getPortfolioItems,
  getServices,
} from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/locale";

const BASE_URL = "https://apex-tech.sa";

const STATIC_ROUTES = [
  { route: "", changeFrequency: "weekly", priority: 1 },
  { route: "about", changeFrequency: "monthly", priority: 0.8 },
  { route: "services", changeFrequency: "monthly", priority: 0.8 },
  { route: "portfolio", changeFrequency: "monthly", priority: 0.8 },
  { route: "blog", changeFrequency: "weekly", priority: 0.8 },
  { route: "academy", changeFrequency: "monthly", priority: 0.8 },
  { route: "contact", changeFrequency: "monthly", priority: 0.7 },
  { route: "privacy", changeFrequency: "yearly", priority: 0.3 },
  { route: "terms", changeFrequency: "yearly", priority: 0.3 },
] as const satisfies ReadonlyArray<{
  route: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}>;

function localizedPath(locale: Locale, route: string): string {
  return route ? `/${locale}/${route}` : `/${locale}`;
}

function buildLanguages(pathByLocale: Record<Locale, string>) {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, `${BASE_URL}${pathByLocale[locale]}`])
  );
}

function buildLocalizedEntry(options: {
  pathByLocale: Record<Locale, string>;
  currentLocale: Locale;
  lastModified?: Date;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE_URL}${options.pathByLocale[options.currentLocale]}`,
    ...(options.lastModified ? { lastModified: options.lastModified } : {}),
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: {
      languages: buildLanguages(options.pathByLocale),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap(
    ({ route, changeFrequency, priority }) =>
      SUPPORTED_LOCALES.map((locale) =>
        buildLocalizedEntry({
          currentLocale: locale,
          pathByLocale: {
            en: localizedPath("en", route),
            ar: localizedPath("ar", route),
          },
          changeFrequency,
          priority,
        })
      )
  );

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

  const dynamicEntries: MetadataRoute.Sitemap = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const service of serviceMap.get(locale) ?? []) {
      dynamicEntries.push(
        buildLocalizedEntry({
          currentLocale: locale,
          pathByLocale: {
            en: `/en/services/${service.slug}`,
            ar: `/ar/services/${service.slug}`,
          },
          lastModified: service.updatedAt,
          changeFrequency: "monthly",
          priority: 0.7,
        })
      );
    }

    for (const post of postMap.get(locale) ?? []) {
      dynamicEntries.push(
        buildLocalizedEntry({
          currentLocale: locale,
          pathByLocale: {
            en: `/en/blog/${post.slug}`,
            ar: `/ar/blog/${post.slug}`,
          },
          lastModified: post.updatedAt,
          changeFrequency: "weekly",
          priority: 0.7,
        })
      );
    }

    for (const item of portfolioMap.get(locale) ?? []) {
      dynamicEntries.push(
        buildLocalizedEntry({
          currentLocale: locale,
          pathByLocale: {
            en: `/en/portfolio/${item.slug}`,
            ar: `/ar/portfolio/${item.slug}`,
          },
          lastModified: item.updatedAt,
          changeFrequency: "monthly",
          priority: 0.7,
        })
      );
    }

    for (const course of courseMap.get(locale) ?? []) {
      dynamicEntries.push(
        buildLocalizedEntry({
          currentLocale: locale,
          pathByLocale: {
            en: `/en/academy/${course.slug}`,
            ar: `/ar/academy/${course.slug}`,
          },
          lastModified: course.updatedAt,
          changeFrequency: "monthly",
          priority: 0.7,
        })
      );

      for (const lesson of course.lessons) {
        dynamicEntries.push(
          buildLocalizedEntry({
            currentLocale: locale,
            pathByLocale: {
              en: `/en/academy/${course.slug}/${lesson.slug}`,
              ar: `/ar/academy/${course.slug}/${lesson.slug}`,
            },
            lastModified: lesson.updatedAt,
            changeFrequency: "monthly",
            priority: 0.6,
          })
        );
      }
    }
  }

  return [...staticEntries, ...dynamicEntries];
}
