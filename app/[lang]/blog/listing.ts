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
    heading: isAr ? "أدلة تطوير البرمجيات للسوق الخليجي" : "Software development guides for the Gulf",
    intro: isAr
      ? "تكاليف مؤرخة، ومقارنات تقنية، ومتطلبات الامتثال في السعودية والإمارات وقطر، مكتوبة لمن يخطط لمشروع."
      : "Dated costs, technical comparisons and compliance requirements in Saudi Arabia, the UAE and Qatar, written for people planning a project.",
  };
}

/**
 * Metadata for one page of the blog index.
 *
 * Pages beyond the first carry a "Page N" title and a self-canonical, and stay
 * indexable. They used to be `noindex, follow`, but Google treats a page that is
 * noindexed for long as nofollow too, so the older articles that appear only on
 * pages 2+ lost their main crawl path and waited on the sitemap alone. Google's
 * own pagination guidance is exactly this: index every page, canonical to itself.
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
  const pageNote = page > 1 ? (isAr ? ` الصفحة ${page}.` : ` Page ${page}.`) : "";

  const base = buildPageMeta(lang, {
    title: isAr
      ? `المدونة — أدلة تطوير البرمجيات${suffix}`
      : `Blog — Software Development Guides${suffix}`,
    description: isAr
      ? `أدلة عملية في تطوير التطبيقات والمواقع وتكاليفها في الخليج: أسعار مؤرخة، مقارنات تقنية، ومتطلبات الامتثال المحلية.${pageNote}`
      : `Practical guides to app and web development costs in the Gulf: dated pricing, technical comparisons and local compliance requirements.${pageNote}`,
    path,
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

  return withFeed;
}

/** Total pages for a collection of `totalItems` articles. */
export function pageCount(totalItems: number): number {
  return Math.max(1, Math.ceil(totalItems / POSTS_PER_PAGE));
}
