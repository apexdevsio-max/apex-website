import Link from "next/link";
import Image from "next/image";

import type { BlogCard } from "@/lib/content/blog-view";
import type { Locale } from "@/lib/i18n/locale";
import { getCategoryByKey } from "@/lib/content/taxonomy";
import { CATEGORY_STYLE } from "@/lib/content/category-style";
import { formatDate, readTimeLabel } from "@/lib/i18n/format";

/**
 * Article card. Posts without an image get a typographic cover in their cluster's
 * colour instead of the old near-black tile with an emoji in the corner.
 */
export function PostCard({ post, lang, headingLevel = "h2" }: { post: BlogCard; lang: Locale; headingLevel?: "h2" | "h3" }) {
  const key = post.categories[0];
  const category = key ? getCategoryByKey(key) : undefined;
  const style = key ? CATEGORY_STYLE[key] : undefined;
  const Icon = style?.icon;
  const Heading = headingLevel;

  return (
    <article className="apex-card group relative flex h-full flex-col overflow-hidden" style={{ "--cat": style?.hue } as React.CSSProperties}>
      <div className="apex-cover relative aspect-[16/9]">
        {post.image ? (
          <Image src={post.image} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px" />
        ) : (
          Icon && <Icon aria-hidden="true" strokeWidth={1.25} className="apex-cover-icon" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        {category && <p className="apex-cat-label mb-2">{category.label[lang]}</p>}
        <Heading className="mb-2 text-lg font-bold leading-snug text-apex-text">
          {/* The whole card is clickable through this link's ::after overlay. */}
          <Link href={`/${lang}/blog/${post.slug}`} className="apex-stretched-link">
            {post.title}
          </Link>
        </Heading>
        <p className="mb-4 line-clamp-3 text-base leading-relaxed text-apex-muted">{post.excerpt}</p>
        <p className="mt-auto flex flex-wrap gap-x-3 text-sm text-apex-muted">
          {post.date && <time dateTime={post.date}>{formatDate(post.date, lang)}</time>}
          <span>{readTimeLabel(post.readTime, lang)}</span>
        </p>
      </div>
    </article>
  );
}
