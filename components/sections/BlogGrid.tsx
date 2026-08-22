import Link from "next/link";
import Image from "next/image";

import { Reveal } from "@/components/ui/Reveal";
import { CategoryNav } from "@/components/content/CategoryNav";
import { Pagination } from "@/components/content/Pagination";
import type { BlogCard } from "@/lib/content/blog-view";
import type { Locale } from "@/lib/i18n/locale";
import { getCategoryByKey, type CategoryKey } from "@/lib/content/taxonomy";

/**
 * The article grid shared by the blog index and every category page.
 *
 * This was a client component that received every article and filtered them in
 * the browser. It is now a server component rendering one already-sliced page of
 * cards: no article data crosses to the client, and the category bar and pager
 * are plain links, so both are crawlable.
 */
function PostCard({ post, lang }: { post: BlogCard; lang: Locale }) {
  const isAr = lang === "ar";
  const categoryLabel = post.categories[0]
    ? getCategoryByKey(post.categories[0])?.label[lang]
    : undefined;

  return (
    <Link
      href={`/${lang}/blog/${post.slug}`}
      className="apex-card-base group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
      style={
        {
          "--card-accent": post.accentColor,
          borderColor: "var(--color-border)",
          boxShadow: "none",
        } as React.CSSProperties
      }
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "5/3" }}>
        {post.image ? (
          <Image
            src={post.image}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg,#0a0a0a,#1a1a2e)" }}
            />
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
                backgroundSize: "20px 20px",
              }}
              aria-hidden="true"
            />
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: "140px",
                height: "140px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                background: `radial-gradient(circle,${post.accentColor}28 0%,transparent 70%)`,
              }}
              aria-hidden="true"
            />
            <span
              className="card-emoji"
              style={{
                fontSize: "52px",
                filter: "drop-shadow(0 0 16px rgba(255,255,255,0.25))",
                transition: "transform 0.3s",
              }}
            >
              {post.emoji}
            </span>
          </>
        )}
        {categoryLabel && (
          <div
            className="absolute top-3 px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{
              [isAr ? "left" : "right"]: "10px",
              background: `color-mix(in srgb,${post.accentColor} 20%,rgba(0,0,0,0.5))`,
              border: `1px solid ${post.accentColor}50`,
              color: post.accentColor,
            }}
          >
            {categoryLabel}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 md:p-6" dir={isAr ? "rtl" : "ltr"}>
        <div
          className={`flex items-center gap-2 mb-3 text-xs ${isAr ? "flex-row-reverse" : ""}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          <span>{post.date}</span>
          <span>·</span>
          <span>
            {post.readTime} {isAr ? "دقائق" : "min"}
          </span>
        </div>
        <h3
          className={`font-bold mb-2 leading-snug flex-1 ${isAr ? "font-ar" : "font-en"}`}
          style={{ fontSize: "15px", color: "var(--color-primary-text)" }}
        >
          {post.title}
        </h3>
        <p
          className={`text-sm leading-relaxed mb-4 line-clamp-2 ${isAr ? "font-ar" : "font-en"}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          {post.excerpt}
        </p>
        <div
          className={`flex items-center gap-2 font-bold text-sm mt-auto apex-arrow ${isAr ? "flex-row-reverse" : ""}`}
          style={{ color: post.accentColor }}
        >
          {isAr ? "قراءة المقال" : "Read Article"}
        </div>
      </div>
    </Link>
  );
}

export function BlogGrid({
  lang,
  posts,
  page,
  totalPages,
  basePath,
  activeCategory,
  heading,
  intro,
  eyebrow,
}: {
  lang: Locale;
  /** One page of cards, already sliced and sorted by the caller. */
  posts: BlogCard[];
  page: number;
  totalPages: number;
  basePath: string;
  activeCategory?: CategoryKey;
  heading: string;
  intro: string;
  eyebrow: string;
}) {
  const isAr = lang === "ar";

  return (
    <section
      className="min-h-screen pt-16 md:pt-28 pb-16 md:pb-24 px-6"
      style={{ background: "var(--color-background)" }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-14">
          <span className="apex-section-label gold">{eyebrow}</span>
          <div className="apex-divider reverse" />
          {/*
            Page two onward keeps the same visible heading but must not repeat the
            H1 of page one as a competing target; the paginated pages exist to be
            crawled through, not to rank on their own.
          */}
          {page === 1 ? (
            <h1
              className={`mt-5 font-bold leading-tight ${isAr ? "font-ar" : "font-en"}`}
              style={{ fontSize: "clamp(28px,4vw,52px)", color: "var(--color-primary-text)" }}
            >
              {heading}
            </h1>
          ) : (
            <p
              className={`mt-5 font-bold leading-tight ${isAr ? "font-ar" : "font-en"}`}
              style={{ fontSize: "clamp(28px,4vw,52px)", color: "var(--color-primary-text)" }}
            >
              {heading}
              <span className="sr-only">
                {isAr ? ` — صفحة ${page}` : ` — page ${page}`}
              </span>
            </p>
          )}
          <p
            className={`mt-4 mx-auto leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
            style={{
              maxWidth: "560px",
              fontSize: "clamp(14px,1.5vw,16px)",
              color: "var(--color-secondary-text)",
            }}
          >
            {intro}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <CategoryNav lang={lang} active={activeCategory} />
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <Reveal key={post.slug} delay={index * 60}>
              <PostCard post={post} lang={lang} />
            </Reveal>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20" style={{ color: "var(--color-secondary-text)" }}>
            <div className="text-5xl mb-4">📰</div>
            <p className={isAr ? "font-ar" : "font-en"}>
              {isAr ? "لا توجد مقالات في هذا القسم حاليًا" : "No articles in this category yet"}
            </p>
          </div>
        )}

        <Pagination lang={lang} page={page} totalPages={totalPages} basePath={basePath} />

        <Reveal delay={120}>
          <div
            className="mt-20 rounded-3xl p-6 md:p-10 text-center border relative overflow-hidden"
            style={{
              background: "color-mix(in srgb,var(--color-primary) 6%,var(--color-card))",
              borderColor: "color-mix(in srgb,var(--color-primary) 20%,transparent)",
            }}
          >
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: "400px",
                height: "400px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                background:
                  "radial-gradient(circle,color-mix(in srgb,var(--color-primary) 8%,transparent) 0%,transparent 70%)",
              }}
              aria-hidden="true"
            />
            <div className="relative z-1">
              <div className="text-4xl mb-4">📬</div>
              <h2
                className={`font-bold mb-3 ${isAr ? "font-ar" : "font-en"}`}
                style={{ fontSize: "clamp(18px,2.5vw,26px)", color: "var(--color-primary-text)" }}
              >
                {isAr ? "لا تفوت أي مقال جديد" : "Don't Miss a New Article"}
              </h2>
              <p
                className={`mb-6 ${isAr ? "font-ar" : "font-en"}`}
                style={{ color: "var(--color-secondary-text)", fontSize: "14px" }}
              >
                {isAr
                  ? "تابعنا على وسائل التواصل للحصول على أحدث المقالات التقنية"
                  : "Follow us on social media for the latest technical articles"}
              </p>
              <Link
                href={`/${lang}/contact`}
                className="apex-btn apex-btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm text-white"
              >
                {isAr ? "تواصل معنا" : "Get In Touch"}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
