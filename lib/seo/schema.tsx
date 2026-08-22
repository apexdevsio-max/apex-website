import type { Locale } from "@/lib/i18n/locale";
import { siteUrl } from "./metadata";
import { socialLinks } from "@/data/social-links";
import { author, authorSameAs, hasNamedAuthor } from "@/data/author";

export function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}

type BreadcrumbItem = {
  name: string;
  url: string;
};

/**
 * The social profile URLs, minus the blanks. data/social-links.ts intentionally
 * defaults these to empty strings, and an empty `sameAs: []` is a weaker signal
 * than omitting the property, so callers spread this only when it is non-empty.
 */
function organizationSameAs(): string[] {
  return [socialLinks.instagram, socialLinks.linkedin, socialLinks.twitter].filter(Boolean);
}

export function buildOrganizationSchema(lang: Locale) {
  const isAr = lang === "ar";
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    // Stable @id so BlogPosting's author/publisher references resolve to this
    // node rather than declaring separate same-named entities.
    "@id": `${siteUrl}/#organization`,
    name: "APEX",
    url: siteUrl,
    logo: `${siteUrl}/images/Apex_logo.png`,
    description: isAr
      ? "شركة برمجيات سورية تبني تطبيقات موبايل ومواقع ويب وحلول ذكاء اصطناعي ومتاجر إلكترونية"
      : "A Syrian software company building mobile apps, websites, AI solutions, and e-commerce platforms",
    slogan: isAr ? "تقنية تتحدث عنك" : "Technology That Speaks for You",
    foundingLocation: "Syria",
    areaServed: ["SA", "AE", "QA", "SY"],
    // Spread rather than assign: an empty `sameAs: []` is a weaker signal than
    // omitting the property, and assigning unconditionally shipped the empty
    // array on every page while the social profiles were unset.
    ...(organizationSameAs().length ? { sameAs: organizationSameAs() } : {}),
    knowsAbout: [
      "Software Development",
      "Mobile App Development",
      "Web Development",
      "Artificial Intelligence",
      "UI/UX Design",
      "E-Commerce Development",
    ],
    knowsLanguage: ["ar", "en"],
    serviceType: [
      "Mobile App Development",
      "Web Development",
      "AI Solutions",
      "E-commerce Development",
      "UI/UX Design",
    ],
    priceRange: "$$",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: socialLinks.whatsapp,
      contactType: "customer support",
      availableLanguage: ["Arabic", "English"],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "SY",
    },
  };
}

/**
 * The named author as a Person node, or undefined while unconfigured.
 *
 * Kept deliberately separate from the Organization: a personal portfolio in the
 * Organization's `sameAs` asserts that APEX and that individual are one entity.
 * Here the same URL is correct, because this node *is* the person.
 *
 * `worksFor` points at the Organization's stable `@id`, which is what links the
 * two nodes into one graph without merging their identities.
 */
export function buildPersonSchema(lang: Locale) {
  if (!hasNamedAuthor()) return undefined;

  const isAr = lang === "ar";
  const name = isAr && author.nameAr ? author.nameAr : author.name;
  const jobTitle = isAr && author.jobTitleAr ? author.jobTitleAr : author.jobTitle;
  const profiles = authorSameAs();

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#author`,
    name,
    ...(jobTitle ? { jobTitle } : {}),
    ...(author.url ? { url: author.url } : {}),
    ...(profiles.length ? { sameAs: profiles } : {}),
    worksFor: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "APEX",
    },
    knowsAbout: [
      "Software Development",
      "Mobile App Development",
      "Web Development",
      "Arabic Localisation",
      "Gulf Regulatory Compliance",
    ],
    knowsLanguage: ["ar", "en"],
  };
}

export function buildServiceSchema(
  slug: string,
  title: string,
  summary: string,
  lang: Locale
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: title,
    description: summary,
    url: `${siteUrl}/${lang}/services/${slug}`,
    provider: {
      "@type": "Organization",
      name: "APEX",
      url: siteUrl,
    },
    areaServed: ["SY", "MENA"],
    audience: {
      "@type": "BusinessAudience",
    },
    serviceType: title,
  };
}

/**
 * FAQPage markup is what earns the expandable Q&A block in Google results, which
 * lifts click-through on commercial service queries. Only emit it when the page
 * actually renders the same questions — mismatched FAQ markup is a manual-action
 * risk, not just a wasted signal.
 */
export function buildFaqSchema(faq: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildServiceCollectionSchema(
  services: Array<{ slug: string; title: string; summary: string }>,
  lang: Locale
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "APEX Services",
    description: "Digital solutions offered by APEX",
    url: `${siteUrl}/${lang}/services`,
    numberOfItems: services.length,
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.title,
        description: s.summary,
        url: `${siteUrl}/${lang}/services/${s.slug}`,
      },
    })),
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "APEX",
    url: siteUrl,
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
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

export function buildBlogPostingSchema(params: {
  title: string;
  excerpt: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
  image?: string;
  lang: Locale;
  /**
   * Which entity authored this article. "person" uses the named author when one
   * is configured; anything else attributes to the Organization. Callers decide
   * per article — see `bylineFor` in lib/content/byline.ts.
   */
  byline?: "person" | "team";
}) {
  const { title, excerpt, url, datePublished, dateModified, image, lang } = params;
  const isAr = lang === "ar";
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt,
    url,
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    // Author is the named Person when one is configured, and the Organization
    // otherwise. Both reference a stable `@id` that resolves to the matching node
    // emitted on the same page, so the graph describes one author rather than
    // several loosely-named copies.
    //
    // A named person matters most on the regulated subjects these guides cover —
    // SAMA licensing, PDPL, DHA requirements — where search engines apply a
    // stricter standard and "APEX Team" substantiates nothing. `publisher` stays
    // the Organization either way: the company publishes, the person writes.
    author: params.byline === "person" && hasNamedAuthor()
      ? {
          "@type": "Person",
          "@id": `${siteUrl}/#author`,
          name: author.name,
          ...(author.url ? { url: author.url } : {}),
          ...(authorSameAs().length ? { sameAs: authorSameAs() } : {}),
        }
      : {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          name: "APEX",
          url: siteUrl,
          ...(organizationSameAs().length ? { sameAs: organizationSameAs() } : {}),
        },
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "APEX",
      url: siteUrl,
      // Google requires publisher.logo to be an ImageObject, not a bare URL
      // string; as a string the logo is ignored for article rich results.
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/Apex_logo.png`,
        width: 1200,
        height: 630,
      },
    },
    image: image || `${siteUrl}/images/Apex_logo.png`,
    inLanguage: isAr ? "ar" : "en",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

/**
 * Extracts the Q&A pairs out of an article's FAQ section for FAQPage markup.
 *
 * Every long-form article ends with a frequently-asked-questions section, written
 * in one of two shapes depending on the author: `### Question` headings, or bold
 * `**Question?**` paragraphs. Both are recognised here so the markup does not
 * depend on which convention a given article happens to use.
 *
 * Only content after an FAQ heading is scanned, so an ordinary `###` heading
 * elsewhere in the article is never mistaken for a question. Answers are trimmed
 * of markdown links and emphasis because Google requires FAQ answer text to be
 * plain — markup inside an answer invalidates the rich result.
 */
export function extractFaqs(content: string): Array<{ question: string; answer: string }> {
  const faqHeading = /^##\s+(?:الأسئلة الشائعة|Frequently asked questions|FAQ)\s*$/im.exec(content);
  if (!faqHeading) return [];

  const start = faqHeading.index + faqHeading[0].length;
  // The FAQ block ends at the next `##` section (typically the conclusion).
  const rest = content.slice(start);
  const nextSection = /^##\s+/m.exec(rest);
  const block = nextSection ? rest.slice(0, nextSection.index) : rest;

  const plain = (value: string) =>
    value
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → their text
      .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
      .replace(/[*_`]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const faqs: Array<{ question: string; answer: string }> = [];

  // `\z` is not a JavaScript regex anchor — it matches a literal "z", which
  // silently dropped the final question of every article. The lookahead below
  // ends the match at the next question or at true end-of-input instead.
  const END = String.raw`$(?![\s\S])`;

  // Shape one: `### Question` followed by prose.
  for (const match of block.matchAll(
    new RegExp(String.raw`^###[^\S\n]+(.+?)[^\S\n]*\n([\s\S]*?)(?=^###[^\S\n]+|${END})`, "gm")
  )) {
    const question = plain(match[1]);
    const answer = plain(match[2]);
    if (question && answer) faqs.push({ question, answer });
  }

  // Shape two: `**Question?**` on its own line, answer in the paragraph below.
  if (faqs.length === 0) {
    for (const match of block.matchAll(
      new RegExp(String.raw`^\*\*(.+?)\*\*[^\S\n]*\n+([\s\S]*?)(?=^\*\*|${END})`, "gm")
    )) {
      const question = plain(match[1]);
      const answer = plain(match[2]);
      if (question && answer) faqs.push({ question, answer });
    }
  }

  return faqs;
}

export function buildLocalBusinessSchema(lang: Locale) {
  const isAr = lang === "ar";
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "APEX",
    image: `${siteUrl}/images/Apex_logo.png`,
    url: siteUrl,
    telephone: socialLinks.whatsapp,
    email: socialLinks.email,
    description: isAr
      ? "شركة برمجيات سورية - تطبيقات، ويب، ذكاء اصطناعي"
      : "Syrian software company - Apps, Web, AI",
    address: {
      "@type": "PostalAddress",
      addressCountry: "SY",
    },
    areaServed: ["SY", "MENA"],
    // See buildOrganizationSchema — omit rather than emit an empty array.
    ...(organizationSameAs().length ? { sameAs: organizationSameAs() } : {}),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: socialLinks.whatsapp,
      contactType: "customer support",
      availableLanguage: ["Arabic", "English"],
    },
  };
}

export function buildBlogSchema(lang: Locale) {
  const isAr = lang === "ar";
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: isAr ? "مدونة APEX" : "APEX Blog",
    description: isAr
      ? "مقالات تقنية وخبرات من فريق APEX"
      : "Technical articles and insights from the APEX team",
    url: `${siteUrl}/${lang}/blog`,
    publisher: {
      "@type": "Organization",
      name: "APEX",
      logo: `${siteUrl}/images/Apex_logo.png`,
    },
  };
}

export function buildPortfolioCollectionSchema(
  items: Array<{ title: string; summary: string; slug: string }>,
  lang: Locale
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "APEX Portfolio",
    description: "Projects built by APEX",
    url: `${siteUrl}/${lang}/portfolio`,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: item.title,
        description: item.summary,
        url: `${siteUrl}/${lang}/portfolio/${item.slug}`,
      },
    })),
  };
}

export function buildCourseSchema(params: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: params.name,
    description: params.description,
    provider: {
      "@type": "Organization",
      name: "APEX",
      url: siteUrl,
    },
    url: params.url,
  };
}

export function buildCreativeWorkSchema(params: {
  title: string;
  summary: string;
  description: string;
  url: string;
  image?: string;
  tags?: string[];
  lang: Locale;
}) {
  const { title, summary, url, image, tags, lang } = params;
  const isAr = lang === "ar";
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description: summary,
    url,
    ...(image ? { image } : {}),
    ...(tags ? { keywords: tags.join(", ") } : {}),
    inLanguage: isAr ? "ar" : "en",
    creator: {
      "@type": "Organization",
      name: "APEX",
      url: siteUrl,
    },
  };
}
