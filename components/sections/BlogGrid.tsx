"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";

import { Reveal } from "@/components/ui/Reveal";
import type { BlogPost } from "@/lib/content/content-loader";
import type { Locale } from "@/lib/i18n/locale";
import { MOCK_POSTS } from "@/lib/mock/blog-data";

function extractFirstImage(content: string): string | undefined {
  const match = /^!\[.*\]\((.*)\)$/m.exec(content);
  return match?.[1] ?? undefined;
}

const CATS_AR = [
  { key: "all", label: "الكل" },
  { key: "lang-framework", label: "لغات برمجة و أطر عمل" },
  { key: "mobile", label: "برمجة الموبايل" },
  { key: "web", label: "برمجة الويب" },
  { key: "comparisons", label: "تقييمات و مقارنات" },
  { key: "selected", label: "مواضيع منتقاة" },
  { key: "practical", label: "تجارب عملية" },
];

const CATS_EN = [
  { key: "all", label: "All" },
  { key: "lang-framework", label: "Languages & Frameworks" },
  { key: "mobile", label: "Mobile Programming" },
  { key: "web", label: "Web Programming" },
  { key: "comparisons", label: "Reviews & Comparisons" },
  { key: "selected", label: "Selected Topics" },
  { key: "practical", label: "Practical Experiences" },
];

type GridPost = {
  slug: string;
  categories: string[];
  emoji: string;
  image?: string;
  readTime: number;
  accentColor: string;
  featured?: boolean;
  ar: { title: string; excerpt: string; date: string };
  en: { title: string; excerpt: string; date: string };
};

function FeaturedCard({ post, lang }: { post: GridPost; lang: Locale }) {
  const isAr = lang === "ar";
  const content = post[lang];

  return (
    <Link
      href={`/${lang}/blog/${post.slug}`}
      className="apex-card-base group col-span-full flex flex-col md:flex-row rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
      style={
        {
          "--card-accent": post.accentColor,
          borderColor: "var(--color-border)",
          boxShadow: "none",
        } as React.CSSProperties
      }
      dir={isAr ? "rtl" : "ltr"}
    >
      <div
          className="relative shrink-0 overflow-hidden"
          style={{
            width: "100%",
            maxWidth: "340px",
            minHeight: "220px",
          }}
        >
          {post.image ? (
            <Image
              src={post.image}
              alt=""
              fill
              className="object-cover"
              sizes="340px"
            />
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg,#0f0c29,#302b63)" }}
              />
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
                aria-hidden="true"
              />
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: "200px",
                  height: "200px",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  background: `radial-gradient(circle,${post.accentColor}35 0%,transparent 70%)`,
                }}
                aria-hidden="true"
              />
              <span
                className="card-emoji"
                style={{
                  fontSize: "72px",
                  filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3))",
                  transition: "transform 0.3s",
                }}
              >
                {post.emoji}
              </span>
            </>
          )}
          <div
            className="absolute top-3 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              [isAr ? "left" : "right"]: "12px",
              background: `color-mix(in srgb,${post.accentColor} 22%,rgba(0,0,0,0.5))`,
              border: `1px solid ${post.accentColor}55`,
              color: post.accentColor,
              backdropFilter: "blur(8px)",
            }}
          >
            {isAr ? "⭐ مميز" : "⭐ Featured"}
          </div>
        </div>

      <div className="flex flex-col justify-center p-5 md:p-8 flex-1">
        <div className={`flex items-center gap-3 mb-4 ${isAr ? "flex-row-reverse" : ""}`}>
          <span className="apex-tag">
            {isAr
              ? CATS_AR.find((cat) => cat.key === post.categories[0])?.label
              : CATS_EN.find((cat) => cat.key === post.categories[0])?.label}
          </span>
          <span className="text-xs" style={{ color: "var(--color-secondary-text)" }}>
            {content.date} · {post.readTime} {isAr ? "دقائق" : "min read"}
          </span>
        </div>
        <h2
          className={`font-bold mb-3 leading-snug ${isAr ? "font-ar" : "font-en"}`}
          style={{ fontSize: "clamp(18px,2.2vw,24px)", color: "var(--color-primary-text)" }}
        >
          {content.title}
        </h2>
        <p
          className={`leading-relaxed mb-5 ${isAr ? "font-ar" : "font-en"}`}
          style={{ fontSize: "14px", color: "var(--color-secondary-text)" }}
        >
          {content.excerpt}
        </p>
        <div
          className={`flex items-center gap-2 font-bold text-sm apex-arrow ${isAr ? "flex-row-reverse" : ""}`}
          style={{ color: post.accentColor }}
        >
          {isAr ? "قراءة المقال" : "Read Article"}
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post, lang }: { post: GridPost; lang: Locale }) {
  const isAr = lang === "ar";
  const content = post[lang];

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
      <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "5/3" }}
        >
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
          <div
            className="absolute top-3 px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{
              [isAr ? "left" : "right"]: "10px",
              background: `color-mix(in srgb,${post.accentColor} 20%,rgba(0,0,0,0.5))`,
              border: `1px solid ${post.accentColor}50`,
              color: post.accentColor,
            }}
          >
            {isAr
              ? CATS_AR.find((cat) => cat.key === post.categories[0])?.label
              : CATS_EN.find((cat) => cat.key === post.categories[0])?.label}
          </div>
        </div>

      <div className="flex flex-col flex-1 p-4 md:p-6" dir={isAr ? "rtl" : "ltr"}>
        <div
          className={`flex items-center gap-2 mb-3 text-xs ${isAr ? "flex-row-reverse" : ""}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          <span>{content.date}</span>
          <span>·</span>
          <span>{post.readTime} {isAr ? "دقائق" : "min"}</span>
        </div>
        <h3
          className={`font-bold mb-2 leading-snug flex-1 ${isAr ? "font-ar" : "font-en"}`}
          style={{ fontSize: "15px", color: "var(--color-primary-text)" }}
        >
          {content.title}
        </h3>
        <p
          className={`text-sm leading-relaxed mb-4 line-clamp-2 ${isAr ? "font-ar" : "font-en"}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          {content.excerpt}
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
  mdxPosts,
}: {
  lang: Locale;
  mdxPosts: BlogPost[];
}) {
  const isAr = lang === "ar";
  const cats = isAr ? CATS_AR : CATS_EN;
  const [activeFilter, setActiveFilter] = useState("all");

  const mockPostList = useMemo(
    () =>
      Object.entries(MOCK_POSTS).map(([slug, post], index) => {
        const arImage = extractFirstImage(post.ar.content || "");
        const enImage = extractFirstImage(post.en.content || "");
        return {
          slug,
          categories: post.categories,
          emoji: post.emoji,
          image: enImage || arImage || undefined,
          readTime: post.readTime,
          accentColor: post.accentColor,
          featured: index === 0,
          ar: {
            title: post.ar.title,
            excerpt: post.ar.excerpt,
            date: post.ar.date,
          },
          en: {
            title: post.en.title,
            excerpt: post.en.excerpt,
            date: post.en.date,
          },
        };
      }),
    []
  );

  const posts: GridPost[] = useMemo(() => {
    if (mdxPosts.length === 0) return mockPostList;

    const mockBySlug = new Map(mockPostList.map((p) => [p.slug, p]));
    let nextIndex = mockPostList.length;

    return mdxPosts.map((post) => {
      const mdxImage = extractFirstImage(post.content) || undefined;
      const mock = mockBySlug.get(post.slug);
      if (mock) {
        return {
          ...mock,
          image: mdxImage || mock.image,
          [lang]: {
            title: post.title,
            excerpt: post.excerpt,
            date: mock[lang].date,
          },
        };
      }
      const fallback = mockPostList[nextIndex % mockPostList.length];
      nextIndex++;
      return {
        ...fallback,
        slug: post.slug,
        image: mdxImage || fallback.image,
        [lang]: {
          title: post.title,
          excerpt: post.excerpt,
          date: "",
        },
      };
    });
  }, [mdxPosts, lang, mockPostList]);

  const featured = posts.find((post) => post.featured);
  const regular = posts.filter((post) => !post.featured);
  const filtered =
    activeFilter === "all"
      ? regular
      : regular.filter((post) => post.categories.includes(activeFilter));

  return (
    <section
      className="min-h-screen pt-16 md:pt-28 pb-16 md:pb-24 px-6"
      style={{ background: "var(--color-background)" }}
    >
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-14">
          <span className="apex-section-label gold">{isAr ? "المدونة" : "Blog"}</span>
          <div className="apex-divider reverse" />
          <h1
            className={`mt-5 font-bold leading-tight ${isAr ? "font-ar" : "font-en"}`}
            style={{ fontSize: "clamp(28px,4vw,52px)", color: "var(--color-primary-text)" }}
          >
            {isAr ? "مقالات تقنية متخصصة" : "Technical Articles & Insights"}
          </h1>
          <p
            className={`mt-4 mx-auto leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
            style={{ maxWidth: "500px", fontSize: "clamp(14px,1.5vw,16px)", color: "var(--color-secondary-text)" }}
          >
            {isAr
              ? "نشاركك خبراتنا في تطوير الويب، الموبايل، والذكاء الاصطناعي"
              : "We share our expertise in web, mobile, and AI development"}
          </p>
        </Reveal>

        {featured && (
          <Reveal delay={80} className="mb-10">
            <FeaturedCard post={featured} lang={lang} />
          </Reveal>
        )}

        <Reveal delay={100}>
          <div className="flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible justify-start md:justify-center gap-2 mb-10 py-1">
            {cats.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveFilter(cat.key)}
                className={`px-5 min-h-[44px] py-3.5 rounded-full text-sm font-bold transition-all duration-200 border ${isAr ? "font-ar" : "font-en"}`}
                style={
                  activeFilter === cat.key
                    ? {
                        background: "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
                        borderColor: "transparent",
                        color: "#fff",
                        boxShadow: "0 4px 18px color-mix(in srgb,var(--color-primary) 38%,transparent)",
                        transform: "translateY(-1px)",
                      }
                    : {
                        background: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-secondary-text)",
                      }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post, index) => (
            <Reveal key={post.slug} delay={index * 60}>
              <PostCard post={post} lang={lang} />
            </Reveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20" style={{ color: "var(--color-secondary-text)" }}>
            <div className="text-5xl mb-4">📰</div>
            <p className={isAr ? "font-ar" : "font-en"}>
              {isAr ? "لا توجد مقالات في هذا القسم حاليًا" : "No articles in this category yet"}
            </p>
          </div>
        )}

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
                background: "radial-gradient(circle,color-mix(in srgb,var(--color-primary) 8%,transparent) 0%,transparent 70%)",
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