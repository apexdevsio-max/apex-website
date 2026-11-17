import type { MetadataRoute } from "next";

import { getBlogPosts, getPortfolioItems, getServices } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { siteUrl } from "@/lib/seo/metadata";
import { CATEGORIES } from "@/lib/content/taxonomy";
import { LEGAL_LAST_UPDATED } from "@/lib/legal";

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

/**
 * Every `lastModified` here is a real content date. It used to be the file mtime,
 * which on a fresh checkout is the build time, so every deploy marked 40 pages as
 * changed and taught crawlers to ignore the field site-wide.
 *
 * Paginated listings (/blog/page/N) are indexable and linked from page 1, but are
 * not listed: they hold no content of their own beyond the articles listed here.
 */
function latest(dates: Array<string | undefined>): string | undefined {
  return dates.filter((d): d is string => Boolean(d)).sort().at(-1);
}

/**
 * One entry per locale, each self-canonical and carrying the full reciprocal
 * hreflang set, so the Arabic half of the site is listed in `<loc>` too.
 */
function localized(
  pathFor: (locale: Locale) => string,
  changeFrequency: ChangeFrequency,
  priority: number,
  lastModified?: string,
  images?: string[]
): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, `${siteUrl}${pathFor(locale)}`])
  ) as Record<string, string>;
  languages["x-default"] = languages[DEFAULT_LOCALE];

  return SUPPORTED_LOCALES.map((locale) => ({
    url: `${siteUrl}${pathFor(locale)}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
    alternates: { languages },
    ...(images?.length ? { images: images.map((src) => `${siteUrl}${src}`) } : {}),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Every article, service and project exists in both locales, so the English
  // collection defines the URL set and its dates.
  const [posts, services, projects] = await Promise.all([
    getBlogPosts(DEFAULT_LOCALE),
    getServices(DEFAULT_LOCALE),
    getPortfolioItems(DEFAULT_LOCALE),
  ]);

  const postDate = (post: (typeof posts)[number]) => post.dateModified ?? post.datePublished;
  const newestPost = latest(posts.map(postDate));
  const newestService = latest(services.map((s) => s.dateModified));
  const newestProject = latest(projects.map((p) => p.dateModified));

  return [
    ...localized((l) => `/${l}`, "weekly", 1.0, latest([newestPost, newestService, newestProject])),
    ...localized((l) => `/${l}/services`, "monthly", 0.9, newestService),
    ...localized((l) => `/${l}/portfolio`, "monthly", 0.8, newestProject),
    ...localized((l) => `/${l}/blog`, "weekly", 0.8, newestPost),
    ...localized((l) => `/${l}/about`, "monthly", 0.7, newestProject),
    ...localized((l) => `/${l}/contact`, "yearly", 0.7),
    ...localized((l) => `/${l}/privacy`, "yearly", 0.2, LEGAL_LAST_UPDATED),
    ...localized((l) => `/${l}/terms`, "yearly", 0.2, LEGAL_LAST_UPDATED),

    ...services.flatMap((service) =>
      localized((l) => `/${l}/services/${service.slug}`, "monthly", 0.9, service.dateModified)
    ),
    ...projects.flatMap((project) =>
      localized(
        (l) => `/${l}/portfolio/${project.slug}`,
        "yearly",
        0.6,
        project.dateModified,
        [project.cover, ...(project.images ?? [])].filter((src, i, all) => all.indexOf(src) === i)
      )
    ),
    ...CATEGORIES.map((category) => ({
      category,
      newest: latest(posts.filter((post) => post.categories.includes(category.key)).map(postDate)),
    })).flatMap(({ category, newest }) =>
      localized((l) => `/${l}/blog/category/${category.slug}`, "weekly", 0.6, newest)
    ),
    ...posts.flatMap((post) =>
      localized((l) => `/${l}/blog/${post.slug}`, "monthly", 0.7, postDate(post))
    ),
  ];
}
