import { notFound }      from "next/navigation";
import type { Metadata } from "next";
import dynamic            from "next/dynamic";

import { getBlogPosts }  from "@/lib/content/content-loader";
import { isLocale }      from "@/lib/i18n/locale";
import { buildPageMeta } from "@/lib/seo/metadata";

const BlogGrid = dynamic(
  () => import("@/components/sections/BlogGrid").then((m) => m.BlogGrid),
  {
    ssr: true,
    loading: () => (
      <div className="min-h-screen pt-28 pb-24 px-6" style={{ background: "var(--color-background)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="h-4 w-24 mx-auto mb-4 rounded-full animate-pulse" style={{ background: "var(--color-border)" }} />
            <div className="h-10 w-48 mx-auto rounded animate-pulse" style={{ background: "var(--color-border)" }} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl h-80 animate-pulse" style={{ background: "var(--color-border)" }} />
            ))}
          </div>
        </div>
      </div>
    ),
  },
);

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isAr = lang === "ar";
  return buildPageMeta(lang === "ar" ? "ar" : "en", {
    title: isAr ? "المدونة — APEX" : "Blog — APEX",
    description: isAr
      ? "مقالات تقنية وخبرات من فريق APEX."
      : "Technical articles and insights from the APEX team.",
    path: `/${lang}/blog`,
  });
}

export default async function BlogPage({ params }: Props) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang       = langParam;
  const mdxPosts   = await getBlogPosts(lang);

  return <BlogGrid lang={lang} mdxPosts={mdxPosts} />;
}
