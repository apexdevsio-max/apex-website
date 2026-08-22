import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { SUPPORTED_LOCALES, toLocale } from "@/lib/i18n/locale";
import { CATEGORIES, getCategoryBySlug } from "@/lib/content/taxonomy";
import { CategoryListing, buildCategoryMetadata } from "./category-listing";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((lang) =>
    CATEGORIES.map((category) => ({ lang, slug: category.slug }))
  );
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  return buildCategoryMetadata({ lang: toLocale(lang), category, page: 1 });
}

export default async function BlogCategoryPage({ params }: Props) {
  const { lang, slug } = await params;
  return <CategoryListing lang={lang} slug={slug} page={1} />;
}
