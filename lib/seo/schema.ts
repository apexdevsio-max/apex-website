import type { Locale } from "@/lib/i18n/locale";
import { siteUrl } from "./metadata";
import { socialLinks } from "@/data/social-links";
import { author, authorSameAs, hasNamedAuthor } from "@/data/author";

/**
 * Every node references the Organization, WebSite and Person by these ids, so a
 * page's JSON-LD describes one connected graph instead of several loosely named
 * copies of "APEX".
 */
const ORG_ID = `${siteUrl}/#organization`;
const WEBSITE_ID = `${siteUrl}/#website`;
const AUTHOR_ID = `${siteUrl}/#author`;
const orgRef = { "@id": ORG_ID };

/** The company works remotely with clients anywhere. */
const AREA_SERVED = "Worldwide";

/** Blank profiles are dropped; an empty `sameAs` is a weaker signal than none. */
function organizationSameAs(): string[] {
  return [socialLinks.linkedin, socialLinks.instagram, socialLinks.twitter].filter(Boolean);
}

function absoluteUrl(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//.test(value)) return value;
  return `${siteUrl}${value.startsWith("/") ? "" : "/"}${value}`;
}

export function buildOrganizationSchema(lang: Locale) {
  const isAr = lang === "ar";
  const sameAs = organizationSameAs();
  const legalName = process.env.NEXT_PUBLIC_LEGAL_NAME;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "APEX",
    alternateName: ["أبيكس", "APEX Software"],
    ...(legalName ? { legalName } : {}),
    url: `${siteUrl}/`,
    // A square mark meets Google's logo requirements; the wide wordmark is 360x133.
    logo: { "@type": "ImageObject", url: `${siteUrl}/icon-512.png`, width: 512, height: 512 },
    description: isAr
      ? "شركة برمجيات مقرّها سوريا تبني تطبيقات الجوال والمواقع وأنظمة الذكاء الاصطناعي بالعربية والإنجليزية، وتعمل عن بُعد مع عملاء حول العالم."
      : "A software company based in Syria that builds mobile apps, websites and AI systems in Arabic and English, working remotely with clients around the world.",
    email: socialLinks.email,
    address: { "@type": "PostalAddress", addressCountry: "SY" },
    areaServed: AREA_SERVED,
    knowsLanguage: ["ar", "en"],
    knowsAbout: [
      "Mobile app development",
      "Web development",
      "Artificial intelligence",
      "Arabic localisation",
      "Data protection compliance",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: socialLinks.whatsapp,
      email: socialLinks.email,
      contactType: "sales",
      availableLanguage: ["Arabic", "English"],
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "APEX",
    url: `${siteUrl}/`,
    inLanguage: ["ar", "en"],
    publisher: orgRef,
  };
}

/** The named author, or undefined while unconfigured. Linked to the company via `worksFor`. */
export function buildPersonSchema(lang: Locale) {
  if (!hasNamedAuthor()) return undefined;
  const isAr = lang === "ar";
  const jobTitle = isAr && author.jobTitleAr ? author.jobTitleAr : author.jobTitle;
  const profiles = authorSameAs();
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": AUTHOR_ID,
    name: authorName(lang),
    // The about page carries the author's profile section.
    url: `${siteUrl}/${lang}/about#author`,
    ...(jobTitle ? { jobTitle } : {}),
    ...(profiles.length ? { sameAs: profiles } : {}),
    worksFor: orgRef,
    knowsLanguage: ["ar", "en"],
  };
}

/** One resolution of the author's display name, shared by the byline, the author box and JSON-LD. */
export function authorName(lang: Locale): string {
  return lang === "ar" && author.nameAr ? author.nameAr : author.name;
}

export function buildServiceSchema(slug: string, title: string, summary: string, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteUrl}/${lang}/services/${slug}#service`,
    name: title,
    description: summary,
    url: `${siteUrl}/${lang}/services/${slug}`,
    serviceType: title,
    provider: orgRef,
    areaServed: AREA_SERVED,
    audience: { "@type": "BusinessAudience" },
    inLanguage: lang,
  };
}

/** Only emitted where the page renders the same questions, which Google requires. */
export function buildFaqSchema(faq: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function buildServiceCollectionSchema(services: Array<{ slug: string; title: string; summary: string }>, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: lang === "ar" ? "خدمات APEX" : "APEX services",
    url: `${siteUrl}/${lang}/services`,
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: { "@id": `${siteUrl}/${lang}/services/${service.slug}#service`, "@type": "Service", name: service.title, url: `${siteUrl}/${lang}/services/${service.slug}` },
    })),
  };
}

export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildBlogSchema(lang: Locale) {
  const isAr = lang === "ar";
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${siteUrl}/${lang}/blog#blog`,
    name: isAr ? "مدونة APEX" : "APEX blog",
    description: isAr
      ? "أدلة عملية لتطوير البرمجيات: التكاليف، والامتثال، والتعريب، والذكاء الاصطناعي."
      : "Practical software development guides: costs, compliance, Arabic localisation and AI.",
    url: `${siteUrl}/${lang}/blog`,
    inLanguage: lang,
    publisher: orgRef,
    isPartOf: { "@id": WEBSITE_ID },
  };
}

export function buildBlogPostingSchema(params: {
  title: string;
  excerpt: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  /** Inline hero image, if the article has one. */
  image?: string;
  lang: Locale;
  /** Whether the named author (when configured) or the company wrote it. */
  byline: "person" | "team";
  section?: string;
  keywords?: string[];
}) {
  const { title, excerpt, url, datePublished, dateModified, image, lang, byline, section, keywords } = params;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: title,
    description: excerpt,
    url,
    ...(datePublished ? { datePublished } : {}),
    dateModified: dateModified ?? datePublished,
    author: byline === "person" && hasNamedAuthor() ? { "@id": AUTHOR_ID, "@type": "Person", name: authorName(lang) } : orgRef,
    publisher: orgRef,
    // Every article has a generated 1200x630 card, which meets Google's image
    // size requirement; the 360x133 logo used to stand in and did not.
    image: absoluteUrl(image) ?? `${url}/opengraph-image`,
    inLanguage: lang,
    isPartOf: { "@id": `${siteUrl}/${lang}/blog#blog` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(section ? { articleSection: section } : {}),
    ...(keywords?.length ? { keywords: keywords.join(", ") } : {}),
  };
}

/**
 * Q&A pairs from an article's FAQ section, as plain text. Recognises both
 * `### Question` headings and bold `**Question?**` paragraphs.
 */
export function extractFaqs(content: string): Array<{ question: string; answer: string }> {
  const faqHeading = /^##\s+(?:الأسئلة الشائعة|Frequently asked questions|FAQ)\s*$/im.exec(content);
  if (!faqHeading) return [];

  const start = faqHeading.index + faqHeading[0].length;
  const rest = content.slice(start);
  const nextSection = /^##\s+/m.exec(rest);
  const block = nextSection ? rest.slice(0, nextSection.index) : rest;

  const plain = (value: string) =>
    value
      // Thematic breaks (`---`) between sections used to end up inside the last answer.
      .replace(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/gm, "")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/[*_`]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const faqs: Array<{ question: string; answer: string }> = [];
  const END = String.raw`$(?![\s\S])`;

  for (const match of block.matchAll(new RegExp(String.raw`^###[^\S\n]+(.+?)[^\S\n]*\n([\s\S]*?)(?=^###[^\S\n]+|${END})`, "gm"))) {
    const question = plain(match[1]);
    const answer = plain(match[2]);
    if (question && answer) faqs.push({ question, answer });
  }

  if (faqs.length === 0) {
    for (const match of block.matchAll(new RegExp(String.raw`^\*\*(.+?)\*\*[^\S\n]*\n+([\s\S]*?)(?=^\*\*|${END})`, "gm"))) {
      const question = plain(match[1]);
      const answer = plain(match[2]);
      if (question && answer) faqs.push({ question, answer });
    }
  }

  return faqs;
}

export function buildPortfolioCollectionSchema(items: Array<{ title: string; summary: string; slug: string }>, lang: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: lang === "ar" ? "أعمال APEX" : "APEX portfolio",
    url: `${siteUrl}/${lang}/portfolio`,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: { "@type": "CreativeWork", name: item.title, description: item.summary, url: `${siteUrl}/${lang}/portfolio/${item.slug}` },
    })),
  };
}

export function buildCreativeWorkSchema(params: { title: string; summary: string; url: string; image?: string; lang: Locale; dateModified?: string }) {
  const { title, summary, url, image, lang, dateModified } = params;
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description: summary,
    url,
    ...(image ? { image: absoluteUrl(image) } : {}),
    ...(dateModified ? { dateModified } : {}),
    inLanguage: lang,
    creator: orgRef,
  };
}
