import type { Metadata } from "next";

import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";
import { openGraph } from "./openGraph";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://apex.sy";
export const metadataBase = new URL(siteUrl);

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
};

function normalizePath(path: string): string {
  if (!path) return "/";

  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  const normalized = withLeadingSlash.replace(/\/+/g, "/");

  return normalized.length > 1 && normalized.endsWith("/")
    ? normalized.slice(0, -1)
    : normalized;
}

function buildLocalizedPath(path: string, locale: Locale): string {
  const normalizedPath = normalizePath(path);
  const segments = normalizedPath.split("/").filter(Boolean);

  if (segments.length === 0) {
    return `/${locale}`;
  }

  if (SUPPORTED_LOCALES.includes(segments[0] as Locale)) {
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }

  return `/${locale}${normalizedPath === "/" ? "" : normalizedPath}`;
}

// `lang` is the validated locale; `path` may carry an unvalidated locale segment
// straight from the route params. The canonical is rebuilt through
// buildLocalizedPath so its first segment is always the validated locale — quietly
// emitting a canonical for an unrecognised locale would point search engines at a
// URL that does not exist.
function buildAlternates(path: string, lang: Locale) {
  const canonicalPath = buildLocalizedPath(path, lang);
  const languages: Record<Locale, string> = { en: "", ar: "" };
  for (const locale of SUPPORTED_LOCALES) {
    languages[locale] = `${siteUrl}${buildLocalizedPath(canonicalPath, locale)}`;
  }

  return {
    canonical: `${siteUrl}${canonicalPath}`,
    languages: {
      ...languages,
      "x-default": languages[DEFAULT_LOCALE],
    },
  };
}

export function buildBaseMetadata(lang: Locale): Metadata {
  const path = `/${lang}`;
  const url = `${siteUrl}${path}`;

  return {
    metadataBase,
    alternates: buildAlternates(path, lang),
    openGraph: {
      ...openGraph,
      url,
      siteName: "APEX",
      locale: lang === "ar" ? "ar_SY" : "en_US",
      type: "website",
      images: [
        {
          url: `${siteUrl}/${lang}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "APEX",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: [`${siteUrl}/${lang}/opengraph-image`],
    },
  };
}

export function buildPageMeta(lang: Locale, input: PageMetaInput): Metadata {
  const base = buildBaseMetadata(lang);
  const image = input.image ?? `${siteUrl}/${lang}/opengraph-image`;
  const path = buildLocalizedPath(input.path, lang);
  const url = `${siteUrl}${path}`;

  return {
    ...base,
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: buildAlternates(path, lang),
    openGraph: {
      ...(base.openGraph ?? {}),
      title: input.title,
      description: input.description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: "APEX",
        },
      ],
    },
    twitter: {
      ...(base.twitter ?? {}),
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

export function buildPageMetadata(lang: Locale): Metadata {
  const isAr = lang === "ar";

  return buildPageMeta(lang, {
    title: isAr
      ? "APEX - شركة برمجيات | تطبيقات، ويب، وذكاء اصطناعي"
      : "APEX - Software Company | Apps, Web, and AI Solutions",
    description: isAr
      ? "شركة APEX للبرمجيات تبني تطبيقات موبايل ومواقع ويب وحلول ذكاء اصطناعي ومتاجر إلكترونية لفرق تبحث عن تنفيذ احترافي ونمو واضح."
      : "APEX builds mobile apps, websites, AI solutions, and e-commerce platforms for teams that need thoughtful execution and measurable growth.",
    keywords: isAr
      ? [
          "شركة برمجيات",
          "تطوير تطبيقات",
          "تطوير ويب",
          "ذكاء اصطناعي",
          "متجر إلكتروني",
          "تصميم UI UX",
          "شركة تقنية",
          "APEX"
        ]
      : [
          "APEX",
          "software company",
          "mobile app development",
          "web development",
          "AI solutions",
          "e-commerce development",
          "UI UX design"
        ],
    path: `/${lang}`,
  });
}


