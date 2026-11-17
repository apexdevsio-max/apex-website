import Link from "next/link";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { PostCard } from "@/components/content/PostCard";
import { buildBlogCards } from "@/lib/content/blog-view";
import type { BlogPost } from "@/lib/content/content-loader";
import type { Locale } from "@/lib/i18n/locale";

/** Links the home page into the blog, which it previously did not link to at all. */
export function LatestGuides({ lang, posts }: { lang: Locale; posts: BlogPost[] }) {
  const isAr = lang === "ar";
  return (
    <section className="apex-section">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow={isAr ? "المدونة" : "Blog"}
          title={isAr ? "أحدث الأدلة" : "Latest guides"}
          subtitle={isAr ? "تكاليف، وامتثال، وتعريب، مكتوبة لمن يخطط لمشروع." : "Costs, compliance and Arabic localisation, written for people planning a project."}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {buildBlogCards(posts).map((card) => (
            <PostCard key={card.slug} post={card} lang={lang} headingLevel="h3" />
          ))}
        </div>
        <Link href={`/${lang}/blog`} className="apex-btn-outline mt-10">
          {isAr ? "كل المقالات" : "All articles"}
        </Link>
      </div>
    </section>
  );
}
