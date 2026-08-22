import type { Metadata } from "next";

import type { Locale } from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import { POSTS_PER_PAGE } from "@/lib/content/taxonomy";

/**
 * Copy and metadata shared by the blog index and its /page/<n> routes, so the two
 * cannot drift into describing the same listing differently.
 */
export function listingCopy(lang: Locale) {
  const isAr = lang === "ar";
  return {
    eyebrow: isAr ? "المدونة" : "Blog",
    heading: isAr ? "مقالات تقنية متخصصة" : "Technical Articles & Insights",
    intro: isAr
      ? "نشاركك خبراتنا في تطوير الويب، الموبايل، والذكاء الاصطناعي"
      : "We share our expertise in web, mobile, and AI development",
  };
}

/**
 * Metadata for one page of the blog index.
 *
 * Pages beyond the first carry a "Page N" title and are marked `noindex, follow`:
 * they hold no unique content of their own, so indexing them competes with page
 * one for the same query while adding nothing. `follow` still lets crawlers walk
 * through them to reach the articles, which is the whole purpose of the pager.
 */
export function buildListingMetadata({
  lang,
  page,
  path,
}: {
  lang: Locale;
  page: number;
  path: string;
}): Metadata {
  const isAr = lang === "ar";
  const suffix = page > 1 ? (isAr ? ` — صفحة ${page}` : ` — Page ${page}`) : "";

  const base = buildPageMeta(lang, {
    title: isAr
      ? `المدونة — أدلة تطوير البرمجيات${suffix}`
      : `Blog — Software Development Guides${suffix}`,
    description: isAr
      ? "أدلة عملية في تطوير التطبيقات والمواقع وتكاليفها في الخليج — أسعار واقعية، مقارنات تقنية، ومتطلبات الامتثال المحلية."
      : "Practical guides to app and web development costs in the Gulf — realistic pricing, technical comparisons, and local compliance requirements.",
    path,
    keywords: isAr
      ? ["مدونة تقنية", "تكلفة تطوير التطبيقات", "أدلة برمجية", "تطوير الويب", "الخليج"]
      : ["technology blog", "app development cost", "developer guides", "web development", "Gulf market"],
  });

  // Feed autodiscovery: the `<link rel="alternate" type="application/rss+xml">`
  // that lets a reader or aggregator find the feed from the blog page itself,
  // without being told the URL. Spread onto the alternates buildPageMeta already
  // produced so the canonical and hreflang links are preserved.
  const withFeed: Metadata = {
    ...base,
    alternates: {
      ...base.alternates,
      types: { "application/rss+xml": `${siteUrl}/${lang}/blog/feed.xml` },
    },
  };

  if (page === 1) return withFeed;

  return {
    ...withFeed,
    robots: { index: false, follow: true },
  };
}

/** Total pages for a collection of `totalItems` articles. */
export function pageCount(totalItems: number): number {
  return Math.max(1, Math.ceil(totalItems / POSTS_PER_PAGE));
}
