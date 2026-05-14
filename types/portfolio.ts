export type PortfolioProject = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  category?: string;
  tags?: string[];
  url?: string;
  updatedAt?: Date;
};
