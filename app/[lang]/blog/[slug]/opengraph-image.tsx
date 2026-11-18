import { notFound } from "next/navigation";

import { getBlogPostBySlug, getBlogPosts } from "@/lib/content/content-loader";
import { getPrimaryCategory } from "@/lib/content/taxonomy";
import { isLocale, SUPPORTED_LOCALES } from "@/lib/i18n/locale";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/seo/og-card";

/**
 * Per-article social preview card, rendered from the article's own title at build
 * time so it can never disagree with the page it represents.
 */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const dynamicParams = false;

export async function generateStaticParams() {
  const params = await Promise.all(
    SUPPORTED_LOCALES.map(async (lang) =>
      (await getBlogPosts(lang)).map((post) => ({ lang, slug: post.slug }))
    )
  );
  return params.flat();
}

export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const post = await getBlogPostBySlug(lang, slug);
  if (!post) notFound();

  const category = getPrimaryCategory(post);

  return renderOgCard({
    locale: lang,
    eyebrow: category?.label[lang] ?? (lang === "ar" ? "المدونة" : "Blog"),
    title: post.title,
  });
}
