import Link from "next/link";
import { Rss } from "lucide-react";

import { FilterRail } from "@/components/ui/FilterRail";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Pagination } from "@/components/content/Pagination";
import { PostCard } from "@/components/content/PostCard";
import { BlogSearch, type SearchEntry } from "@/components/content/BlogSearch";
import type { BlogCard } from "@/lib/content/blog-view";
import type { Locale } from "@/lib/i18n/locale";
import { CATEGORIES, type Category } from "@/lib/content/taxonomy";

/** The article listing shared by the blog index, its pages and every category page. */
export function BlogGrid({
  lang,
  posts,
  page,
  totalPages,
  basePath,
  category,
  heading,
  intro,
  searchIndex,
  pillar,
}: {
  lang: Locale;
  /** One page of cards, already sliced by the caller. */
  posts: BlogCard[];
  page: number;
  totalPages: number;
  basePath: string;
  category?: Category;
  heading: string;
  intro: string;
  /** Only passed on page one of the index. */
  searchIndex?: SearchEntry[];
  /** The cluster's hub article, linked from category pages. */
  pillar?: { slug: string; title: string };
}) {
  const isAr = lang === "ar";
  // Every page has its own <h1>; page two onward used to demote it to a <p>.
  const pageSuffix = page > 1 ? (isAr ? ` — صفحة ${page}` : ` — page ${page}`) : "";

  const railItems = [
    { key: "all", label: isAr ? "كل المقالات" : "All articles", href: `/${lang}/blog`, active: !category },
    ...CATEGORIES.map((c) => ({
      key: c.key,
      label: c.label[lang],
      href: `/${lang}/blog/category/${c.slug}`,
      active: c.key === category?.key,
    })),
  ];

  return (
    <section className="px-6 pt-10 pb-20 md:pt-16">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          as="h1"
          eyebrow={category ? (isAr ? "المدونة" : "Blog") : undefined}
          title={`${heading}${pageSuffix}`}
          subtitle={intro}
        />

        {category && page === 1 && (
          <div className="mb-10 max-w-3xl">
            <p className="text-base leading-relaxed text-apex-muted">{category.intro[lang]}</p>
            {pillar && (
              <p className="mt-4 text-base">
                <span className="text-apex-muted">{isAr ? "ابدأ من هنا: " : "Start here: "}</span>
                <Link href={`/${lang}/blog/${pillar.slug}`} className="font-bold text-apex-primary underline underline-offset-4">
                  {pillar.title}
                </Link>
              </p>
            )}
          </div>
        )}

        {searchIndex && <BlogSearch lang={lang} entries={searchIndex} />}

        <FilterRail label={isAr ? "أقسام المدونة" : "Blog topics"} items={railItems} />

        {posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} lang={lang} />
            ))}
          </div>
        ) : (
          <p className="py-20 text-center text-apex-muted">
            {isAr ? "لا توجد مقالات في هذا القسم حالياً." : "No articles in this topic yet."}
          </p>
        )}

        <Pagination lang={lang} page={page} totalPages={totalPages} basePath={basePath} />

        <aside className="mt-16 flex flex-col gap-4 rounded-2xl border border-apex-border bg-apex-card p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-xl font-bold text-apex-text">
              {isAr ? "لديك مشروع وتريد رأياً مباشراً؟" : "Have a project and want a direct answer?"}
            </h2>
            <p className="mt-2 text-base text-apex-muted">
              {isAr
                ? "أرسل لنا وصفاً قصيراً ونردّ خلال يوم عمل بأسئلة عن النطاق."
                : "Send a short description and we reply within one business day with scoping questions."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${lang}/contact`} className="apex-btn-primary">
              {isAr ? "تواصل معنا" : "Get in touch"}
            </Link>
            <a href={`/${lang}/blog/feed.xml`} className="apex-btn-outline">
              <Rss size={16} aria-hidden="true" />
              {isAr ? "تابع عبر RSS" : "Follow via RSS"}
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
