import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";

import { getBlogPostBySlug, getBlogPosts, type BlogPost } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale } from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import {
  authorName,
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildOrganizationSchema,
  buildPersonSchema,
  extractFaqs,
} from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { MarkdownContent } from "@/components/content/MarkdownContent";
import { TableOfContents } from "@/components/content/TableOfContents";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { ShareLinks } from "@/components/content/ShareLinks";
import { PostCard } from "@/components/content/PostCard";
import { collectHeadings } from "@/lib/content/headings";
import { buildBlogCards, extractFirstImage } from "@/lib/content/blog-view";
import { getCategoryByKey, getPrimaryCategory } from "@/lib/content/taxonomy";
import { bylineFor } from "@/lib/content/byline";
import { formatDate, readTimeLabel } from "@/lib/i18n/format";
import { socialLinks } from "@/data/social-links";

type Props = { params: Promise<{ lang: string; slug: string }> };

export async function generateStaticParams() {
  const params = await Promise.all(
    SUPPORTED_LOCALES.map(async (lang) => (await getBlogPosts(lang)).map((post) => ({ lang, slug: post.slug })))
  );
  return params.flat();
}

export const dynamicParams = false;

/**
 * Related articles ranked by topical closeness: a shared primary category counts
 * most, then any shared category, then shared keywords. Ties go to the newest.
 * The previous version scored on six vague categories, so 40 of 71 articles were
 * never recommended and the PDPL guide recommended three AI articles.
 */
function relatedPosts(current: BlogPost, all: BlogPost[], count: number): BlogPost[] {
  const keywords = new Set((current.keywords ?? []).map((k) => k.toLowerCase()));
  return all
    .filter((post) => post.slug !== current.slug)
    .map((post) => {
      let score = 0;
      if (post.categories[0] === current.categories[0]) score += 6;
      score += post.categories.filter((c) => current.categories.includes(c)).length * 2;
      score += (post.keywords ?? []).filter((k) => keywords.has(k.toLowerCase())).length;
      return { post, score };
    })
    .sort((a, b) => b.score - a.score || (b.post.datePublished ?? "").localeCompare(a.post.datePublished ?? ""))
    .slice(0, count)
    .map(({ post }) => post);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const post = await getBlogPostBySlug(lang, slug);
  if (!post) return {};

  const image = extractFirstImage(post.content);
  return buildPageMeta(lang, {
    title: post.seoTitle ?? post.title,
    description: post.excerpt,
    path: `/${lang}/blog/${slug}`,
    keywords: post.keywords,
    image: image ? { url: `${siteUrl}${image}` } : undefined,
    imageFallback: `${siteUrl}/${lang}/blog/${slug}/opengraph-image`,
    article: {
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      section: getPrimaryCategory(post)?.label[lang],
    },
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const [post, allPosts] = await Promise.all([getBlogPostBySlug(lang, slug), getBlogPosts(lang)]);
  if (!post) notFound();

  const isAr = lang === "ar";
  const url = `${siteUrl}/${lang}/blog/${slug}`;
  const category = getPrimaryCategory(post);
  const byline = bylineFor(post.categories);
  const writer = byline === "person" ? authorName(lang) : isAr ? "فريق APEX" : "APEX team";
  const personSchema = byline === "person" ? buildPersonSchema(lang) : undefined;
  const updated = post.dateModified && post.dateModified > (post.datePublished ?? "") ? post.dateModified : undefined;

  const pillar = category && category.pillar !== slug ? allPosts.find((p) => p.slug === category.pillar) : undefined;

  // Previous/next within the primary category, in publication order.
  const siblings = category ? allPosts.filter((p) => p.categories[0] === category.key) : [];
  const position = siblings.findIndex((p) => p.slug === slug);
  const newer = position > 0 ? siblings[position - 1] : undefined;
  const older = position >= 0 ? siblings[position + 1] : undefined;

  const related = buildBlogCards(relatedPosts(post, allPosts, 3));
  const faqs = extractFaqs(post.content);
  const headings = collectHeadings(post.content);
  const whatsappDigits = socialLinks.whatsapp.replace(/[^\d]/g, "");

  const trail = [
    { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
    { name: isAr ? "المدونة" : "Blog", url: `${siteUrl}/${lang}/blog` },
    ...(category ? [{ name: category.label[lang], url: `${siteUrl}/${lang}/blog/category/${category.slug}` }] : []),
    { name: post.title, url },
  ];

  return (
    <div className="px-6 pt-8 pb-20">
      <JsonLd schema={buildOrganizationSchema(lang)} />
      {personSchema && <JsonLd schema={personSchema} />}
      <JsonLd schema={buildBreadcrumbSchema(trail)} />
      <JsonLd
        schema={buildBlogPostingSchema({
          title: post.title,
          excerpt: post.excerpt,
          url,
          datePublished: post.datePublished,
          dateModified: post.dateModified,
          image: extractFirstImage(post.content),
          lang,
          byline,
          section: category?.label[lang],
          keywords: post.keywords,
        })}
      />
      {faqs.length > 0 && <JsonLd schema={buildFaqSchema(faqs)} />}

      <div className="mx-auto max-w-6xl">
        <Breadcrumbs
          label={isAr ? "مسار التنقل" : "Breadcrumb"}
          items={trail.map((item, index) => ({
            name: item.name,
            href: index < trail.length - 1 ? item.url.replace(siteUrl, "") : undefined,
          }))}
        />

        <header className="mb-10 max-w-3xl">
          {category && (
            <Link href={`/${lang}/blog/category/${category.slug}`} className="apex-cat-label mb-3 inline-flex min-h-[44px] items-center">
              {category.label[lang]}
            </Link>
          )}
          <h1 className="apex-page-title">{post.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-apex-muted">{post.excerpt}</p>
          <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-apex-muted">
            <Link href={`/${lang}/about${byline === "person" ? "#author" : ""}`} rel="author" className="font-bold text-apex-text hover:text-apex-primary">
              {writer}
            </Link>
            {post.datePublished && (
              <span>
                {isAr ? "نُشر " : "Published "}
                <time dateTime={post.datePublished}>{formatDate(post.datePublished, lang)}</time>
              </span>
            )}
            {updated && (
              <span>
                {isAr ? "حُدّث " : "Updated "}
                <time dateTime={updated}>{formatDate(updated, lang)}</time>
              </span>
            )}
            <span>{readTimeLabel(post.readTime, lang)}</span>
          </p>
          {pillar && (
            <p className="mt-4 text-sm text-apex-muted">
              {isAr ? "جزء من دليل: " : "Part of the guide: "}
              <Link href={`/${lang}/blog/${pillar.slug}`} className="font-bold text-apex-primary underline underline-offset-4">
                {pillar.title}
              </Link>
            </p>
          )}
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="min-w-0 max-w-[72ch]">
            {post.summary && post.summary.length > 0 && (
              <section aria-labelledby="key-takeaways" className="apex-takeaways mb-10">
                <h2 id="key-takeaways" className="mb-3 text-base font-bold text-apex-text">
                  {isAr ? "الخلاصة السريعة" : "Key takeaways"}
                </h2>
                <ul className="grid gap-2">
                  {post.summary.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>
            )}

            <div className="lg:hidden">
              <TableOfContents entries={headings} lang={lang} />
            </div>

            <article className="apex-prose">
              <MarkdownContent source={post.content} lang={lang} />
            </article>

            {post.sources && post.sources.length > 0 && (
              <section aria-labelledby="sources" className="mt-12 border-t border-apex-border pt-8">
                <h2 id="sources" className="mb-4 text-lg font-bold text-apex-text">
                  {isAr ? "المصادر" : "Sources"}
                </h2>
                <ol className="grid list-decimal gap-2 ps-5 text-base text-apex-muted">
                  {post.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-apex-primary underline underline-offset-2">
                        {source.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <div className="mt-10 border-t border-apex-border pt-6">
              <ShareLinks url={url} title={post.title} lang={lang} />
            </div>

            <aside className="mt-10 rounded-2xl border border-apex-border bg-apex-card p-6">
              <p className="font-bold text-apex-text">{writer}</p>
              <p className="mt-2 text-base leading-relaxed text-apex-muted">
                {isAr
                  ? "نكتب هذه الأدلة من موقع من يبني البرمجيات: الأسعار مأخوذة من جدول أسعار واحد مؤرخ، والمتطلبات التنظيمية مربوطة بنصوصها الرسمية حيث أمكن. ليست استشارة قانونية."
                  : "We write these guides as the people who build the software: prices come from one dated rate card, and regulatory requirements link to the official text where possible. Not legal advice."}
              </p>
              <Link href={`/${lang}/about`} className="mt-3 inline-flex min-h-[44px] items-center font-bold text-apex-primary hover:underline">
                {isAr ? "من نحن" : "About APEX"}
              </Link>
            </aside>

            <aside className="mt-8 rounded-2xl border border-apex-primary/40 p-6 md:p-8">
              <h2 className="text-xl font-bold text-apex-text">
                {isAr ? "تريد تطبيق هذا على مشروعك؟" : "Want to apply this to your project?"}
              </h2>
              <p className="mt-2 text-base text-apex-muted">
                {isAr
                  ? "أرسل وصفاً قصيراً لمشروعك. نردّ خلال يوم عمل بأسئلة عن النطاق، ثم بتقدير مكتوب."
                  : "Send a short description of your project. We reply within one business day with scoping questions, then a written estimate."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href={`/${lang}/contact`} className="apex-btn-primary">
                  {isAr ? "اطلب تقديراً" : "Request an estimate"}
                </Link>
                <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer" className="apex-btn-whatsapp">
                  <MessageCircle size={16} aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            </aside>

            {(newer || older) && (
              <nav aria-label={isAr ? "مقالات في القسم نفسه" : "More in this topic"} className="mt-10 grid gap-4 sm:grid-cols-2">
                {older && (
                  <Link href={`/${lang}/blog/${older.slug}`} className="rounded-2xl border border-apex-border p-5 hover:border-apex-primary">
                    <span className="block text-sm text-apex-muted">{isAr ? "المقال السابق" : "Previous article"}</span>
                    <span className="mt-1 block font-bold text-apex-text">{older.title}</span>
                  </Link>
                )}
                {newer && (
                  <Link href={`/${lang}/blog/${newer.slug}`} className="rounded-2xl border border-apex-border p-5 text-end hover:border-apex-primary sm:col-start-2">
                    <span className="block text-sm text-apex-muted">{isAr ? "المقال التالي" : "Next article"}</span>
                    <span className="mt-1 block font-bold text-apex-text">{newer.title}</span>
                  </Link>
                )}
              </nav>
            )}
          </div>

          <div className="hidden lg:block">
            <TableOfContents entries={headings} lang={lang} />
          </div>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related" className="mt-16">
            <h2 id="related" className="apex-section-title mb-6">
              {isAr ? "مقالات ذات صلة" : "Related articles"}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((card) => (
                <PostCard key={card.slug} post={card} lang={lang} headingLevel="h3" />
              ))}
            </div>
            {category && (
              <p className="mt-6">
                <Link href={`/${lang}/blog/category/${category.slug}`} className="font-bold text-apex-primary hover:underline">
                  {isAr ? `كل مقالات ${getCategoryByKey(category.key)?.label.ar}` : `All ${category.label.en} articles`}
                </Link>
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
