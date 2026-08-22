import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getBlogPosts } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale, toLocale } from "@/lib/i18n/locale";
import { siteUrl } from "@/lib/seo/metadata";
import { JsonLd, buildBreadcrumbSchema } from "@/lib/seo/schema";
import { BlogGrid } from "@/components/sections/BlogGrid";
import { buildBlogCards } from "@/lib/content/blog-view";
import { paginate, parsePageParam } from "@/lib/content/taxonomy";
import { buildListingMetadata, listingCopy, pageCount } from "../../listing";

type Props = { params: Promise<{ lang: string; page: string }> };

/**
 * Page two onward for the blog index. Page one stays at /blog — emitting it here
 * as well would serve the same listing at two URLs.
 */
export async function generateStaticParams() {
  const params: { lang: string; page: string }[] = [];

  for (const lang of SUPPORTED_LOCALES) {
    const posts = await getBlogPosts(lang);
    const total = pageCount(posts.length);
    for (let page = 2; page <= total; page += 1) {
      params.push({ lang, page: String(page) });
    }
  }

  return params;
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, page } = await params;
  const locale = toLocale(lang);
  const parsed = parsePageParam(page) ?? 1;

  return buildListingMetadata({
    lang: locale,
    page: parsed,
    path: `/${locale}/blog/page/${parsed}`,
  });
}

export default async function BlogIndexPage({ params }: Props) {
  const { lang: langParam, page: pageParam } = await params;
  if (!isLocale(langParam)) notFound();

  const parsed = parsePageParam(pageParam);
  if (!parsed || parsed < 2) notFound();

  const lang = langParam;
  const isAr = lang === "ar";
  const posts = await getBlogPosts(lang);
  const cards = buildBlogCards(posts, lang);
  const { items, page, totalPages } = paginate(cards, parsed);

  // A page number past the end would otherwise render an empty grid at a live
  // URL; paginate() clamps, so compare against the request to catch it.
  if (page !== parsed) notFound();

  const copy = listingCopy(lang);
  const breadcrumbItems = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "المدونة" : "Blog", url: `${siteUrl}/${lang}/blog` },
    {
      name: isAr ? `صفحة ${page}` : `Page ${page}`,
      url: `${siteUrl}/${lang}/blog/page/${page}`,
    },
  ];

  return (
    <>
      <JsonLd schema={buildBreadcrumbSchema(breadcrumbItems)} />
      <BlogGrid
        lang={lang}
        posts={items}
        page={page}
        totalPages={totalPages}
        basePath={`/${lang}/blog`}
        eyebrow={copy.eyebrow}
        heading={copy.heading}
        intro={copy.intro}
      />
    </>
  );
}
