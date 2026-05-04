import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getBlogPostBySlug, getBlogPosts } from "@/lib/content/content-loader";
import { SUPPORTED_LOCALES, isLocale } from "@/lib/i18n/locale";
import { buildPageMeta } from "@/lib/seo/metadata";
import { FALLBACK_POST, MOCK_POSTS, MOCK_POST_SLUGS } from "@/lib/mock/blog-data";

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

  return buildPageMeta(locale, {
    title: `${mdxPost?.title ?? mock?.title ?? slug} - APEX`,
    description: mdxPost?.excerpt ?? mock?.excerpt ?? "",
    path: `/${lang}/blog/${slug}`,
  });
}

const hoverStyles = `
  .apex-back:hover { color: var(--color-primary) !important; }
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
  const emoji = mock?.emoji ?? fallback.emoji;
  const accentColor = mock?.accentColor ?? fallback.accentColor;
  const category = mock?.category ?? fallback.category;
  const rawContent = mdxPost?.content ?? mockContent?.content ?? fallback.content;
  const contentLines = rawContent.split("\n");
  const relatedSlugs = MOCK_POST_SLUGS.filter((item) => item !== slug).slice(0, 3);

  return (
    <main
      className="min-h-screen pt-24 pb-24 px-6"
      style={{ background: "var(--color-background)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
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
          className="relative rounded-3xl overflow-hidden mb-10"
          style={{
            height: "clamp(200px,26vw,320px)",
            background: "linear-gradient(135deg,#0a0a0a,#1a1a2e)",
          }}
        >
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
              backgroundSize: "28px 28px",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: "260px",
              height: "260px",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              background: `radial-gradient(circle,${accentColor}30 0%,transparent 70%)`,
            }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ fontSize: "80px", filter: "drop-shadow(0 0 24px rgba(255,255,255,0.3))" }}
          >
            {emoji}
          </div>
          <div
            className="absolute top-4 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{
              [isAr ? "left" : "right"]: "16px",
              background: `color-mix(in srgb,${accentColor} 18%,rgba(0,0,0,0.6))`,
              border: `1px solid ${accentColor}55`,
              color: accentColor,
              backdropFilter: "blur(8px)",
            }}
          >
            {category}
          </div>
        </div>

        <div
          className={`flex items-center gap-3 mb-4 text-xs ${isAr ? "flex-row-reverse" : ""}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
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
            if (!line.trim()) return <div key={index} style={{ height: "8px" }} />;

            if (line.startsWith("## ")) {
              return (
                <h2 key={index} className={`apex-prose-h2 ${isAr ? "font-ar" : "font-en"}`}>
                  {line.replace("## ", "")}
                </h2>
              );
            }

            if (line.startsWith("### ")) {
              return (
                <h3 key={index} className={`apex-prose-h3 ${isAr ? "font-ar" : "font-en"}`}>
                  {line.replace("### ", "")}
                </h3>
              );
            }

            if (line.startsWith("> ")) {
              return (
                <blockquote
                  key={index}
                  className={`apex-prose-quote ${isAr ? "font-ar" : "font-en"}`}
                >
                  {line.replace("> ", "")}
                </blockquote>
              );
            }

            if (line.startsWith("- ")) {
              return (
                <ul key={index} className={`apex-prose-list ${isAr ? "font-ar" : "font-en"}`}>
                  <li>{line.replace("- ", "")}</li>
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
                  >
                    {line.replace("• ", "")}
                  </span>
                </div>
              );
            }

            return (
              <p key={index} className={`apex-prose-p ${isAr ? "font-ar" : "font-en"}`}>
                {line}
              </p>
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
    </main>
  );
}
