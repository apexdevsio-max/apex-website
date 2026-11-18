import type { Metadata } from "next";

import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://apex.sy";
export const metadataBase = new URL(siteUrl);

/** Facebook's locale codes; `ar_SY` tied every Arabic page to Syria rather than to Arabic. */
const OG_LOCALE: Record<Locale, string> = { en: "en_US", ar: "ar_AR" };

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  /** An image of the page's own, used as-is. */
  image?: { url: string; width?: number; height?: number };
  /** Generated 1200x630 card used when the page has no image of its own. */
  imageFallback?: string;
  /** Marks the page as an article for Open Graph and adds its dates. */
  article?: { publishedTime?: string; modifiedTime?: string; section?: string; authors?: string[] };
};

function normalizePath(path: string): string {
  if (!path) return "/";
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  const normalized = withLeadingSlash.replace(/\/+/g, "/");
  return normalized.length > 1 && normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

function buildLocalizedPath(path: string, locale: Locale): string {
  const normalizedPath = normalizePath(path);
  const segments = normalizedPath.split("/").filter(Boolean);
  if (segments.length === 0) return `/${locale}`;
  if (SUPPORTED_LOCALES.includes(segments[0] as Locale)) {
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }
  return `/${locale}${normalizedPath === "/" ? "" : normalizedPath}`;
}

/**
 * Self-canonical plus reciprocal hreflang. The home page's x-default is the bare
 * root, which negotiates a language per visitor; elsewhere it is the English page.
 */
function buildAlternates(path: string, lang: Locale) {
  const canonicalPath = buildLocalizedPath(path, lang);
  const languages: Record<string, string> = {};
  for (const locale of SUPPORTED_LOCALES) {
    languages[locale] = `${siteUrl}${buildLocalizedPath(canonicalPath, locale)}`;
  }
  const isHome = canonicalPath === `/${lang}`;
  languages["x-default"] = isHome ? `${siteUrl}/` : languages[DEFAULT_LOCALE];

  return {
    canonical: `${siteUrl}${canonicalPath}`,
    languages,
    // Feed autodiscovery on every page, not only on the blog index.
    types: { "application/rss+xml": `${siteUrl}/${lang}/blog/feed.xml` },
  };
}

export function buildPageMeta(lang: Locale, input: PageMetaInput): Metadata {
  const path = buildLocalizedPath(input.path, lang);
  const url = `${siteUrl}${path}`;
  const image = input.image
    ? { url: input.image.url, width: input.image.width, height: input.image.height, alt: input.title }
    : { url: input.imageFallback ?? `${siteUrl}/${lang}/opengraph-image`, width: 1200, height: 630, alt: input.title };

  return {
    metadataBase,
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: buildAlternates(path, lang),
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: "APEX",
      locale: OG_LOCALE[lang],
      alternateLocale: SUPPORTED_LOCALES.filter((locale) => locale !== lang).map((locale) => OG_LOCALE[locale]),
      images: [image],
      ...(input.article
        ? {
            type: "article" as const,
            publishedTime: input.article.publishedTime,
            modifiedTime: input.article.modifiedTime ?? input.article.publishedTime,
            section: input.article.section,
            authors: input.article.authors,
          }
        : { type: "website" as const }),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image.url],
    },
  };
}

export function buildPageMetadata(lang: Locale): Metadata {
  const isAr = lang === "ar";
  const title = isAr
    ? "تطوير تطبيقات ومواقع وذكاء اصطناعي لعملاء الخليج | APEX"
    : "App, Web & AI Development for Gulf Businesses | APEX";
  const meta = buildPageMeta(lang, {
    title,
    description: isAr
      ? "تبني APEX تطبيقات الجوال والمواقع وأنظمة الذكاء الاصطناعي بدعم كامل للعربية لعملاء في السعودية والإمارات وقطر، بعقود واضحة وتسليم على مراحل."
      : "APEX builds mobile apps, websites and AI systems with full Arabic support for clients in Saudi Arabia, the UAE and Qatar, with clear contracts and phased delivery.",
    path: `/${lang}`,
  });
  // Absolute: the layout template would otherwise append " — APEX" a second time.
  return { ...meta, title: { absolute: title } };
}
