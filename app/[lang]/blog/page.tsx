import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getBlogPosts } from "@/lib/content/content-loader";
import { isLocale, toLocale } from "@/lib/i18n/locale";
import { siteUrl } from "@/lib/seo/metadata";
import {
  buildOrganizationSchema,
  buildBlogSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { BlogGrid } from "@/components/sections/BlogGrid";
import { buildBlogCards } from "@/lib/content/blog-view";
import { getPrimaryCategory, paginate } from "@/lib/content/taxonomy";
import { buildListingMetadata, listingCopy } from "./listing";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const locale = toLocale(lang);

  return buildListingMetadata({ lang: locale, page: 1, path: `/${locale}/blog` });
}

export default async function BlogPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang = langParam;
  const isAr = lang === "ar";
  const posts = await getBlogPosts(lang);
  const cards = buildBlogCards(posts);
  const searchIndex = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: getPrimaryCategory(post)?.label[lang] ?? "",
  }));
  const { items, page, totalPages } = paginate(cards, 1);

  const copy = listingCopy(lang);
  const breadcrumbItems = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "المدونة" : "Blog", url: `${siteUrl}/${lang}/blog` },
  ];

  return (
    <>
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd schema={buildBlogSchema(lang)} />
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbItems)} />
      <BlogGrid
        lang={lang}
        posts={items}
        page={page}
        totalPages={totalPages}
        basePath={`/${lang}/blog`}
        heading={copy.heading}
        intro={copy.intro}
        searchIndex={searchIndex}
      />
    </>
  );
}
