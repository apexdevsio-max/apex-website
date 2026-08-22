import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getBlogPosts } from "@/lib/content/content-loader";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import { JsonLd, buildBreadcrumbSchema } from "@/lib/seo/schema";
import { BlogGrid } from "@/components/sections/BlogGrid";
import { buildBlogCards, filterByCategory } from "@/lib/content/blog-view";
import { getCategoryBySlug, paginate, type Category } from "@/lib/content/taxonomy";

/**
 * Shared implementation for a category listing, used by both
 * /blog/category/<slug> and /blog/category/<slug>/page/<n>.
 */
export function buildCategoryMetadata({
  lang,
  category,
  page,
}: {
  lang: Locale;
  category: Category;
  page: number;
}): Metadata {
  const isAr = lang === "ar";
  const suffix = page > 1 ? (isAr ? ` — صفحة ${page}` : ` — Page ${page}`) : "";
  const path =
    page > 1
      ? `/${lang}/blog/category/${category.slug}/page/${page}`
      : `/${lang}/blog/category/${category.slug}`;

  const base = buildPageMeta(lang, {
    title: `${category.label[lang]}${suffix}`,
    description: category.description[lang],
    path,
  });

  if (page === 1) return base;

  // See app/[lang]/blog/listing.ts — paginated listings are crawled, not indexed.
  return { ...base, robots: { index: false, follow: true } };
}

export async function CategoryListing({
  lang: langParam,
  slug,
  page: requestedPage,
}: {
  lang: string;
  slug: string;
  page: number;
}) {
  if (!isLocale(langParam)) notFound();
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const lang = langParam;
  const isAr = lang === "ar";

  const posts = await getBlogPosts(lang);
  const cards = filterByCategory(buildBlogCards(posts, lang), category.key);
  const { items, page, totalPages } = paginate(cards, requestedPage);

  if (page !== requestedPage) notFound();

  const basePath = `/${lang}/blog/category/${category.slug}`;
  const breadcrumbItems = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "المدونة" : "Blog", url: `${siteUrl}/${lang}/blog` },
    { name: category.label[lang], url: `${siteUrl}${basePath}` },
    ...(page > 1
      ? [
          {
            name: isAr ? `صفحة ${page}` : `Page ${page}`,
            url: `${siteUrl}${basePath}/page/${page}`,
          },
        ]
      : []),
  ];

  return (
    <>
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbItems)} />
      <JsonLd schema={buildCategoryCollectionSchema({ lang, category, items, basePath })} />
      <BlogGrid
        lang={lang}
        posts={items}
        page={page}
        totalPages={totalPages}
        basePath={basePath}
        activeCategory={category.key}
        eyebrow={isAr ? "المدونة" : "Blog"}
        heading={category.label[lang]}
        intro={category.description[lang]}
      />
    </>
  );
}

/**
 * CollectionPage + ItemList markup for the category, mirroring what
 * buildServiceCollectionSchema does for services. It tells search engines the
 * page is a curated list of articles on one topic rather than a duplicate of the
 * blog index — the distinction that lets a category page rank on its own term.
 */
function buildCategoryCollectionSchema({
  lang,
  category,
  items,
  basePath,
}: {
  lang: Locale;
  category: Category;
  items: Array<{ slug: string; title: string; excerpt: string }>;
  basePath: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.label[lang],
    description: category.description[lang],
    url: `${siteUrl}${basePath}`,
    inLanguage: lang === "ar" ? "ar" : "en",
    isPartOf: {
      "@type": "Blog",
      name: lang === "ar" ? "مدونة APEX" : "APEX Blog",
      url: `${siteUrl}/${lang}/blog`,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/${lang}/blog/${item.slug}`,
        name: item.title,
      })),
    },
  };
}
