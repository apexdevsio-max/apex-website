import type { BlogPost } from "@/lib/content/content-loader";
import type { Locale } from "@/lib/i18n/locale";
import { MOCK_POSTS, POST_META } from "@/lib/mock/blog-data";
import { getPostCategoryKeys, type CategoryKey } from "@/lib/content/taxonomy";

/**
 * Builds the card view-models the blog listing renders.
 *
 * This ran inside BlogGrid as a client `useMemo`, which forced every article —
 * title, excerpt, image, and the whole MOCK_POSTS table — into the RSC payload
 * before a single card could be filtered. Doing it on the server means a page
 * ships only the twelve cards it actually shows, so the payload stays flat as
 * the archive grows toward 200 articles.
 */
export type BlogCard = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  categories: CategoryKey[];
  emoji: string;
  image?: string;
  readTime: number;
  accentColor: string;
};

const DEFAULT_ACCENT = "#00BCD4";
const DEFAULT_EMOJI = "📝";
const WORDS_PER_MINUTE = 200;

/** First markdown image in the body, used as the card thumbnail. */
function extractFirstImage(content: string): string | undefined {
  const match = /^!\[.*\]\((.*)\)$/m.exec(content);
  return match?.[1] ?? undefined;
}

function estimateReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / WORDS_PER_MINUTE));
}

function toCard(post: BlogPost, lang: Locale): BlogCard {
  const meta = POST_META[post.slug];
  const mock = MOCK_POSTS[post.slug];

  // The MDX body is the source of truth for the image; MOCK_POSTS is consulted
  // only for the few slugs that predate the real content.
  const image =
    extractFirstImage(post.content) ??
    (mock ? extractFirstImage(mock[lang]?.content ?? "") : undefined);

  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.datePublished ?? mock?.[lang]?.date ?? "",
    categories: getPostCategoryKeys(post.slug),
    emoji: meta?.emoji ?? mock?.emoji ?? DEFAULT_EMOJI,
    image,
    readTime: meta?.readTime ?? mock?.readTime ?? estimateReadTime(post.content),
    accentColor: meta?.accentColor ?? mock?.accentColor ?? DEFAULT_ACCENT,
  };
}

/**
 * All published articles as cards, newest first.
 *
 * Ordering is explicit rather than inherited from the loader's alphabetical file
 * order: a listing sorted by filename buries the newest work, and both the index
 * and every category page depend on this order being newest-first. Undated posts
 * sort last, and slug breaks ties so the output stays deterministic across
 * builds — this renders into static HTML.
 */
export function buildBlogCards(posts: BlogPost[], lang: Locale): BlogCard[] {
  return posts
    .map((post) => toCard(post, lang))
    .sort((a, b) => {
      if (a.date !== b.date) {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return b.date.localeCompare(a.date);
      }
      return a.slug.localeCompare(b.slug);
    });
}

export function filterByCategory(cards: BlogCard[], key: CategoryKey): BlogCard[] {
  return cards.filter((card) => card.categories.includes(key));
}
