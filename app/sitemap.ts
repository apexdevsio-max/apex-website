import type { MetadataRoute } from "next";
import {
  getAcademyCourses,
  getBlogPosts,
  getPortfolioItems,
  getServices,
} from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES } from "@/lib/i18n/locale";

const BASE_URL = "https://apex-tech.sa";

const ROUTES = ["", "about", "portfolio", "blog", "contact"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = ROUTES.flatMap((route) =>
    SUPPORTED_LOCALES.map((lang) => {
      const path = route ? `/${lang}/${route}` : `/${lang}`;

      const languages = Object.fromEntries(
        SUPPORTED_LOCALES.map((locale) => [
          locale,
          `${BASE_URL}${route ? `/${locale}/${route}` : `/${locale}`}`,
        ])
      );

      return {
        url: `${BASE_URL}${path}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : 0.8,
        alternates: { languages },
      } satisfies MetadataRoute.Sitemap[number];
    })
  );

  const dynamicEntries: MetadataRoute.Sitemap = [];

  const localeData = await Promise.all(
    SUPPORTED_LOCALES.map(async (locale) => {
      const [services, posts, portfolioItems, courses] = await Promise.all([
        getServices(locale),
        getBlogPosts(locale),
        getPortfolioItems(locale),
        getAcademyCourses(locale),
      ]);

      return { locale, services, posts, portfolioItems, courses };
    })
  );

  for (const { locale, services, posts, portfolioItems, courses } of localeData) {
    for (const service of services) {
      dynamicEntries.push({
        url: `${BASE_URL}/${locale}/services/${service.slug}`,
        lastModified: service.updatedAt ?? new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    for (const post of posts) {
      dynamicEntries.push({
        url: `${BASE_URL}/${locale}/blog/${post.slug}`,
        lastModified: post.updatedAt ?? new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const item of portfolioItems) {
      dynamicEntries.push({
        url: `${BASE_URL}/${locale}/portfolio/${item.slug}`,
        lastModified: item.updatedAt ?? new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    for (const course of courses) {
      dynamicEntries.push({
        url: `${BASE_URL}/${locale}/academy/${course.slug}`,
        lastModified: course.updatedAt ?? new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });

      for (const lesson of course.lessons) {
        dynamicEntries.push({
          url: `${BASE_URL}/${locale}/academy/${course.slug}/${lesson.slug}`,
          lastModified: lesson.updatedAt ?? new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        });
      }
    }
  }

  return [...staticEntries, ...dynamicEntries];
}
