import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getBlogPostBySlug, getBlogPosts } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale } from "@/lib/i18n/locale";
import { buildPageMeta, siteUrl } from "@/lib/seo/metadata";
import { CATEGORY_LABELS, FALLBACK_POST, MOCK_POSTS, MOCK_POST_SLUGS } from "@/lib/mock/blog-data";

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
  const locale = isLocale(lang) ? lang : "ar";
  let mdxPost = null;
  try {
    mdxPost = await getBlogPostBySlug(locale, slug);
  } catch {
    mdxPost = null;
  }
  const mock = MOCK_POSTS[slug]?.[locale];
  const rawContent = mdxPost?.content ?? mock?.content ?? "";
  const ogImage = extractFirstImage(rawContent);

  return buildPageMeta(locale, {
    title: `${mdxPost?.title ?? mock?.title ?? slug} - APEX`,
    description: mdxPost?.excerpt ?? mock?.excerpt ?? "",
    path: `/${lang}/blog/${slug}`,
    keywords: POST_KEYWORDS[slug]?.[locale],
    image: ogImage,
  });
}

function renderMarkdownLinks(text: string): string {
  return text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="font-semibold underline decoration-1 underline-offset-2 transition-colors" style="color:var(--color-primary)">$1</a>'
  );
}

const hoverStyles = `
  .apex-prose-bullet { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
  .apex-related:hover { border-color: var(--color-primary) !important; transform: translateY(-3px); }
`;

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
  } catch {
    mdxPost = null;
  }
  const mock = MOCK_POSTS[slug];
  const mockContent = mock?.[lang];
  const fallback = FALLBACK_POST(slug, lang);

  const title = mdxPost?.title ?? mockContent?.title ?? fallback.title;
  const excerpt = mdxPost?.excerpt ?? mockContent?.excerpt ?? fallback.excerpt;
  const date = mockContent?.date ?? fallback.date;
  const readTime = mock?.readTime ?? fallback.readTime;
  const accentColor = mock?.accentColor ?? fallback.accentColor;
  const categoryKey = mock?.categories?.[0] ?? fallback.categories[0];
  const category = CATEGORY_LABELS[categoryKey]?.[lang] ?? categoryKey;
  const rawContent = mdxPost?.content ?? mockContent?.content ?? fallback.content;
  const contentLines = rawContent.split("\n");
  const relatedSlugs = MOCK_POST_SLUGS.filter((item) => item !== slug).slice(0, 3);

  return (
    <div
      className="min-h-screen pt-24 pb-24 px-6"
      style={{ background: "var(--color-background)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: isAr ? "الرئيسية" : "Home", item: `${siteUrl}/${lang}` },
              { "@type": "ListItem", position: 2, name: isAr ? "المدونة" : "Blog", item: `${siteUrl}/${lang}/blog` },
              { "@type": "ListItem", position: 3, name: title },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: title,
            description: excerpt,
            url: `${siteUrl}/${lang}/blog/${slug}`,
            datePublished: date || undefined,
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
            image: `${siteUrl}/images/Apex_logo.png`,
            inLanguage: isAr ? "ar" : "en",
          }),
        }}
      />
      <style dangerouslySetInnerHTML={{ __html: hoverStyles }} />
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/${lang}/blog`}
          className={`apex-back inline-flex items-center gap-2 text-sm font-semibold mb-10 transition-colors ${
            isAr ? "font-ar flex-row-reverse" : "font-en"
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
          className={`flex items-center gap-3 mb-4 text-xs ${isAr ? "flex-row-reverse" : ""}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
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
          {contentLines.map((line, index) => {
            line = line.replace(/\r$/, "");
            if (!line.trim()) return <div key={index} style={{ height: "8px" }} />;

            if (line.startsWith("## ")) {
              return (
                <h2 key={index} className={`apex-prose-h2 ${isAr ? "font-ar" : "font-en"}`}>
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdownLinks(line.replace("## ", "")) }} />
                </h2>
              );
            }

            if (line.startsWith("### ")) {
              return (
                <h3 key={index} className={`apex-prose-h3 ${isAr ? "font-ar" : "font-en"}`}>
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdownLinks(line.replace("### ", "")) }} />
                </h3>
              );
            }

            if (line === "---") {
              return <hr key={index} className="my-10 border-apex-border" style={{ opacity: 0.4 }} />;
            }

            if (line.startsWith("> ")) {
              return (
                <blockquote
                  key={index}
                  className={`apex-prose-quote ${isAr ? "font-ar" : "font-en"}`}
                  dangerouslySetInnerHTML={{ __html: renderMarkdownLinks(line.replace("> ", "")) }}
                />
              );
            }

            if (line.startsWith("- ")) {
              return (
                <ul key={index} className={`apex-prose-list ${isAr ? "font-ar" : "font-en"}`}>
                  <li dangerouslySetInnerHTML={{ __html: renderMarkdownLinks(line.replace("- ", "")) }} />
                </ul>
              );
            }

            if (line.startsWith("• ")) {
              return (
                <div key={index} className="apex-prose-bullet">
                  <span
                    className="mt-2 w-2 h-2 rounded-full shrink-0"
                    style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
                  />
                  <span
                    className={`apex-prose-p ${isAr ? "font-ar" : "font-en"}`}
                    style={{ margin: 0 }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdownLinks(line.replace("• ", "")) }}
                  />
                </div>
              );
            }

            const imgMatch = /^!\[(.*)\]\((.*)\)$/.exec(line);
            if (imgMatch) {
              const isFirstImage = index < 2;
              return (
                <figure key={index} className="my-8">
                  <div className="relative w-full aspect-video">
                    <Image
                      src={imgMatch[2]}
                      alt={imgMatch[1]}
                      fill
                      priority={isFirstImage}
                      className="rounded-2xl object-cover shadow-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 720px"
                    />
                  </div>
                </figure>
              );
            }

            return (
              <p
                key={index}
                className={`apex-prose-p ${isAr ? "font-ar" : "font-en"}`}
                dangerouslySetInnerHTML={{ __html: renderMarkdownLinks(line) }}
              />
            );
          })}
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
            className="apex-btn inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm text-white"
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
                  className="apex-related rounded-xl p-4 border transition-all duration-200"
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
