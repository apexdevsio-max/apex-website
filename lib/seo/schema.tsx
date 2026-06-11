import type { Locale } from "@/lib/i18n/locale";
import { siteUrl } from "./metadata";
import { socialLinks } from "@/data/social-links";

export function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

type BreadcrumbItem = {
  name: string;
  url: string;
};

export function buildOrganizationSchema(lang: Locale) {
  const isAr = lang === "ar";
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    name: "APEX",
    url: siteUrl,
    logo: `${siteUrl}/images/Apex_logo.png`,
    description: isAr
      ? "شركة برمجيات سورية تبني تطبيقات موبايل ومواقع ويب وحلول ذكاء اصطناعي ومتاجر إلكترونية"
      : "A Syrian software company building mobile apps, websites, AI solutions, and e-commerce platforms",
    slogan: isAr ? "تقنية تتحدث عنك" : "Technology That Speaks for You",
    foundingLocation: "Syria",
    areaServed: ["SA", "AE", "QA", "SY"],
    sameAs: [socialLinks.instagram, socialLinks.linkedin, socialLinks.twitter].filter(Boolean),
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
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/en/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
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
  image?: string;
  lang: Locale;
}) {
  const { title, excerpt, url, datePublished, image, lang } = params;
  const isAr = lang === "ar";
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt,
    url,
    ...(datePublished ? { datePublished } : {}),
    author: {
      "@type": "Organization",
      name: "APEX",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "APEX",
      logo: `${siteUrl}/images/Apex_logo.png`,
    },
    image: image || `${siteUrl}/images/Apex_logo.png`,
    inLanguage: isAr ? "ar" : "en",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
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
    sameAs: [socialLinks.instagram, socialLinks.linkedin, socialLinks.twitter].filter(Boolean),
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
  const { title, summary, description, url, image, tags, lang } = params;
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
    dateCreated: new Date().toISOString().split("T")[0],
    creator: {
      "@type": "Organization",
      name: "APEX",
      url: siteUrl,
    },
  };
}
