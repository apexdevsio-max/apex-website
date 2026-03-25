import type { Metadata } from "next";
import { openGraph } from "./openGraph";

export const siteUrl = "https://apex-tech.sa";
export const metadataBase = new URL(siteUrl);

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
};

export function buildBaseMetadata(lang: "ar" | "en"): Metadata {
  const url = `${siteUrl}/${lang}`;
  return {
    metadataBase,
    alternates: {
      canonical: url,
      languages: { ar: `${siteUrl}/ar`, en: `${siteUrl}/en` },
    },
    openGraph: {
      ...openGraph,
      url,
      siteName: "APEX",
      locale: lang === "ar" ? "ar_SA" : "en_US",
      type: "website",
      images: [
        {
          url: "/images/Apex_logo.png",
          width: 1200,
          height: 630,
          alt: "APEX",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      images: ["/images/Apex_logo.png"],
    },
  };
}

export function buildPageMeta(lang: "ar" | "en", input: PageMetaInput): Metadata {
  const base = buildBaseMetadata(lang);
  const image = input.image ?? "/images/Apex_logo.png";
  const url = `${siteUrl}${input.path}`;
  return {
    ...base,
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      ...(base.alternates ?? {}),
      canonical: url,
    },
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

export function buildPageMetadata(lang: "ar" | "en"): Metadata {
  const isAr = lang === "ar";
  return buildPageMeta(lang, {
    title: isAr
      ? "APEX — شركة برمجيات | تطبيقات، ويب، ذكاء اصطناعي"
      : "APEX — Software Company | Apps, Web & AI Solutions",
    description: isAr
      ? "شركة APEX للبرمجيات — نبني تطبيقات موبايل، مواقع ويب، حلول ذكاء اصطناعي، ومتاجر إلكترونية. شريكك التقني الإقليمي."
      : "APEX Software Company — we build mobile apps, websites, AI solutions, and e-commerce platforms. Your regional tech partner.",
    keywords: isAr
      ? [
          "برمجة",
          "تطبيق",
          "مبرمج",
          "شركة برمجيات",
          "ذكاء اصطناعي",
          "AI",
          "متجر إلكتروني",
          "SEO",
          "صناعة محتوى",
          "APEX",
        ]
      : [
          "APEX",
          "software company",
          "mobile app",
          "web development",
          "AI",
          "e-commerce",
          "SEO",
          "content creation",
        ],
    path: `/${lang}`,
  });
}

export const metadata: Metadata = {
  title: "APEX",
  description: "APEX Digital Studio",
  metadataBase,
  openGraph,
  twitter: {
    card: "summary_large_image",
    title: "APEX",
    description: "APEX Digital Studio",
    images: ["/images/Apex_logo.png"],
  },
};
