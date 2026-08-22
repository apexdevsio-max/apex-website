import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getBlogPosts } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, toLocale } from "@/lib/i18n/locale";
import { buildBlogCards, filterByCategory } from "@/lib/content/blog-view";
import { CATEGORIES, getCategoryBySlug, parsePageParam } from "@/lib/content/taxonomy";
import { pageCount } from "../../../../listing";
import { CategoryListing, buildCategoryMetadata } from "../../category-listing";

type Props = { params: Promise<{ lang: string; slug: string; page: string }> };

/**
 * Page two onward for each category. Categories below one page produce no params
 * at all, so no empty pager routes are built.
 */
export async function generateStaticParams() {
  const params: { lang: string; slug: string; page: string }[] = [];

  for (const lang of SUPPORTED_LOCALES) {
    const cards = buildBlogCards(await getBlogPosts(lang), lang);
    for (const category of CATEGORIES) {
      const total = pageCount(filterByCategory(cards, category.key).length);
      for (let page = 2; page <= total; page += 1) {
        params.push({ lang, slug: category.slug, page: String(page) });
      }
    }
  }

  return params;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug, page } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  return buildCategoryMetadata({
    lang: toLocale(lang),
    category,
    page: parsePageParam(page) ?? 1,
  });
}

export default async function BlogCategoryPagedPage({ params }: Props) {
  const { lang, slug, page } = await params;
  const parsed = parsePageParam(page);
  if (!parsed || parsed < 2) notFound();

  return <CategoryListing lang={lang} slug={slug} page={parsed} />;
}
