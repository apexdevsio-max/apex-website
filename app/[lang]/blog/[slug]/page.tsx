import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getBlogPostBySlug, getBlogPosts } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale, toLocale } from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import {
  JsonLd,
  buildOrganizationSchema,
  buildBlogPostingSchema,
  buildBreadcrumbSchema,
} from "@/lib/seo/schema";
import { CATEGORY_LABELS, FALLBACK_POST, MOCK_POSTS, MOCK_POST_SLUGS } from "@/lib/mock/blog-data";
import { MarkdownContent } from "@/components/content/MarkdownContent";

export async function generateStaticParams() {
  const seen = new Set<string>();
  const params: { lang: string; slug: string }[] = [];

  for (const lang of SUPPORTED_LOCALES) {
    const posts = await getBlogPosts(lang);

    for (const post of posts) {
      const key = `${lang}:${post.slug}`;
      if (!seen.has(key)) {
        seen.add(key);
        params.push({ lang, slug: post.slug });
      }
    }

    for (const slug of MOCK_POST_SLUGS) {
      const key = `${lang}:${slug}`;
      if (!seen.has(key)) {
        seen.add(key);
        params.push({ lang, slug });
      }
    }
  }

  return params;
}

function extractFirstImage(content: string): string | undefined {
  const match = /^!\[.*\]\((.*)\)$/m.exec(content);
  return match?.[1] ?? undefined;
}

const POST_KEYWORDS: Record<string, { ar: string[]; en: string[] }> = {
  flutter: {
    ar: ["Flutter", "دارت", "تطوير تطبيقات", "تطبيقات متعددة المنصات", "Google Flutter", "تطوير الموبايل"],
    en: ["Flutter", "Dart", "cross-platform", "mobile development", "Google Flutter", "app development"],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  let mdxPost = null;
  try {
    mdxPost = await getBlogPostBySlug(locale, slug);
  } catch (error) {
    // Content validation errors are recoverable here (the page falls back to
    // static metadata), but they describe real malformed content, so surface
    // them instead of failing silently.
    console.error("Content load failed:", error);
    mdxPost = null;
  }
  const mock = MOCK_POSTS[slug]?.[locale];
  const rawContent = mdxPost?.content ?? mock?.content ?? "";
  const ogImage = extractFirstImage(rawContent);

  return buildPageMeta(locale, {
    title: mdxPost?.title ?? mock?.title ?? slug,
    description: mdxPost?.excerpt ?? mock?.excerpt ?? "",
    path: `/${lang}/blog/${slug}`,
    keywords: POST_KEYWORDS[slug]?.[locale],
    image: ogImage,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !slug) notFound();

  const isAr = lang === "ar";
  let mdxPost = null;
  try {
    mdxPost = await getBlogPostBySlug(lang, slug);
  } catch (error) {
    // Content validation errors are recoverable here (the page falls back to
    // static metadata), but they describe real malformed content, so surface
    // them instead of failing silently.
    console.error("Content load failed:", error);
    mdxPost = null;
  }
  const mock = MOCK_POSTS[slug];
  const mockContent = mock?.[lang];
  const fallback = FALLBACK_POST(slug, lang);

  const title = mdxPost?.title ?? mockContent?.title ?? fallback.title;
  const excerpt = mdxPost?.excerpt ?? mockContent?.excerpt ?? fallback.excerpt;
  const date = mdxPost?.datePublished ?? mockContent?.date ?? fallback.date;
  const readTime = mock?.readTime ?? fallback.readTime;
  const accentColor = mock?.accentColor ?? fallback.accentColor;
  const categoryKey = mock?.categories?.[0] ?? fallback.categories[0];
  const category = CATEGORY_LABELS[categoryKey]?.[lang] ?? categoryKey;
  const rawContent = mdxPost?.content ?? mockContent?.content ?? fallback.content;
  const relatedSlugs = MOCK_POST_SLUGS.filter((item) => item !== slug).slice(0, 3);

  return (
    <div
      className="min-h-screen pt-24 pb-24 px-6"
      style={{ background: "var(--color-background)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <JsonLd schema={buildOrganizationSchema(lang)} />
      <JsonLd
        schema={buildBreadcrumbSchema([
          { name: isAr ? "الرئيسية" : "Home", url: `${siteUrl}/${lang}` },
          { name: isAr ? "المدونة" : "Blog", url: `${siteUrl}/${lang}/blog` },
          { name: title, url: `${siteUrl}/${lang}/blog/${slug}` },
        ])}
      />
      <JsonLd
        schema={buildBlogPostingSchema({
          title,
          excerpt,
          url: `${siteUrl}/${lang}/blog/${slug}`,
          datePublished: date || undefined,
          dateModified: mdxPost?.dateModified,
          image: extractFirstImage(rawContent),
          lang,
        })}
      />
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/${lang}/blog`}
          className={`apex-back inline-flex items-center gap-2 text-sm font-semibold mb-10 transition-colors min-h-[44px] py-2 ${
            isAr ? "font-ar" : "font-en"
          }`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          <span
            style={{
              display: "inline-block",
              transform: isAr ? "none" : "rotate(180deg)",
            }}
          >
            →
          </span>
          {isAr ? "العودة إلى المدونة" : "Back to Blog"}
        </Link>

        <div
          className="flex items-center gap-3 mb-4 text-xs"
          style={{ color: "var(--color-secondary-text)" }}
        >
          <span
            className="px-3 min-h-[28px] flex items-center rounded-full text-xs font-bold"
            style={{
              background: `color-mix(in srgb,${accentColor} 18%,transparent)`,
              border: `1px solid ${accentColor}55`,
              color: accentColor,
            }}
          >
            {category}
          </span>
          {date && <span>{date}</span>}
          {date && <span>·</span>}
          <span>
            {readTime} {isAr ? "دقائق قراءة" : "min read"}
          </span>
        </div>

        <h1
          className={`font-bold mb-4 leading-tight ${isAr ? "font-ar" : "font-en"}`}
          style={{ fontSize: "clamp(22px,3.5vw,40px)", color: "var(--color-primary-text)" }}
        >
          {title}
        </h1>

        <p
          className={`text-lg mb-10 leading-relaxed pb-8 border-b ${isAr ? "font-ar" : "font-en"}`}
          style={{ color: "var(--color-secondary-text)", borderColor: "var(--color-border)" }}
        >
          {excerpt}
        </p>

        <article className="mb-14">
          {!rawContent.trim() ? (
            <div className="text-center py-16" style={{ color: "var(--color-secondary-text)" }}>
              <p className={`text-base ${isAr ? "font-ar" : "font-en"}`}>
                {isAr ? "المحتوى قيد الإعداد..." : "Content coming soon..."}
              </p>
            </div>
          ) : <MarkdownContent source={rawContent} lang={lang} />}
        </article>

        <div
          className="rounded-2xl p-8 text-center border mb-14"
          style={{
            background: "color-mix(in srgb,var(--color-primary) 6%,var(--color-card))",
            borderColor: "color-mix(in srgb,var(--color-primary) 20%,transparent)",
          }}
        >
          <p
            className={`font-bold mb-4 ${isAr ? "font-ar" : "font-en"}`}
            style={{ fontSize: "18px", color: "var(--color-primary-text)" }}
          >
            {isAr ? "هل تريد تطبيق هذه الأفكار في مشروعك؟" : "Want to apply these ideas to your project?"}
          </p>
          <Link
            href={`/${lang}/contact`}
            className="inline-flex items-center gap-2 px-8 min-h-[44px] rounded-full font-bold text-sm text-white"
            style={{
              background: "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
              boxShadow: "0 8px 28px color-mix(in srgb,var(--color-primary) 38%,transparent)",
            }}
          >
            {isAr ? "تواصل مع فريق APEX" : "Contact the APEX Team"}
            <span className={isAr ? "rotate-180 inline-block" : ""}>→</span>
          </Link>
        </div>

        <div>
          <h3
            className={`font-bold mb-6 ${isAr ? "font-ar" : "font-en"}`}
            style={{ fontSize: "18px", color: "var(--color-primary-text)" }}
          >
            {isAr ? "مقالات ذات صلة" : "Related Articles"}
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {relatedSlugs.map((item) => {
              const related = MOCK_POSTS[item]?.[lang];
              if (!related) return null;

              return (
                <Link
                  key={item}
                  href={`/${lang}/blog/${item}`}
                  className="rounded-xl p-4 min-h-[44px] flex items-center border transition-all duration-200"
                  style={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    textDecoration: "none",
                  }}
                  dir={isAr ? "rtl" : "ltr"}
                >
                  <div className="text-2xl mb-2">{MOCK_POSTS[item].emoji}</div>
                  <p
                    className={`text-xs font-semibold leading-snug ${isAr ? "font-ar" : "font-en"}`}
                    style={{ color: "var(--color-primary-text)" }}
                  >
                    {related.title}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
