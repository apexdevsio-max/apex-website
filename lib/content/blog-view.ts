import type { BlogPost } from "@/lib/content/content-loader";
import type { CategoryKey } from "@/lib/content/taxonomy";

/**
 * Card view-models for the blog listings, built on the server so a page ships
 * only the twelve cards it shows.
 */
export type BlogCard = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  categories: CategoryKey[];
  image?: string;
  readTime: number;
};

/** First markdown image in the body, used as the card cover. */
export function extractFirstImage(content: string): string | undefined {
  return /^!\[[^\]]*\]\(([^)\s]+)/m.exec(content)?.[1];
}

/** Cards in the loader's order, which is newest first. */
export function buildBlogCards(posts: BlogPost[]): BlogCard[] {
  return posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.datePublished ?? "",
    categories: post.categories,
    image: extractFirstImage(post.content),
    readTime: post.readTime,
  }));
}

export function filterByCategory(cards: BlogCard[], key: CategoryKey): BlogCard[] {
  return cards.filter((card) => card.categories.includes(key));
}
