export type BlogPostMeta = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date?: string;
  author?: string;
  category?: string;
  tags?: string[];
  readTime?: number;
  updatedAt?: Date;
};
