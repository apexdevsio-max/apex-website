import { CATEGORY_LABELS, POST_META } from "@/lib/mock/blog-data";
import type { Locale } from "@/lib/i18n/locale";

/**
 * Blog taxonomy: the category set, their URL slugs, and the helpers that resolve
 * a post to its category.
 *
 * Categories previously existed only as filter keys inside BlogGrid, applied in
 * the browser after every article had already been shipped in one payload. That
 * works at 39 articles and breaks at 200: a single page carrying every card is
 * slow, and — more costly for search — a client-side filter produces no URL, so
 * none of these topic groupings could ever be indexed or ranked. Each category
 * here is a real, crawlable landing page.
 *
 * The keys are unchanged from the original filter keys so POST_META entries keep
 * working untouched. The `slug` is what appears in the URL and is deliberately
 * kept separate from the key: keys are internal identifiers that are awkward as
 * URLs ("lang-framework"), and decoupling them means a slug can be improved for
 * search later without rewriting every POST_META row.
 */
export type CategoryKey =
  | "lang-framework"
  | "mobile"
  | "web"
  | "comparisons"
  | "selected"
  | "practical";

export type Category = {
  key: CategoryKey;
  /** URL segment under /blog/category/. Stable — changing one needs a redirect. */
  slug: string;
  label: Record<Locale, string>;
  /** Meta description for the category landing page. */
  description: Record<Locale, string>;
};

/**
 * Ordered as they appear in the filter bar. `description` is per-category rather
 * than generated from a template because a listing page whose only unique text is
 * its title reads as thin content — the description is often the sole prose on
 * page one of a category.
 */
export const CATEGORIES: readonly Category[] = [
  {
    key: "lang-framework",
    slug: "languages-frameworks",
    label: { ar: CATEGORY_LABELS["lang-framework"].ar, en: CATEGORY_LABELS["lang-framework"].en },
    description: {
      ar: "أدلة ومقارنات في لغات البرمجة وأطر العمل — Flutter، React Native، Next.js وغيرها — مع معايير اختيار عملية لكل مشروع.",
      en: "Guides and comparisons across programming languages and frameworks — Flutter, React Native, Next.js and more — with practical selection criteria for each project.",
    },
  },
  {
    key: "mobile",
    slug: "mobile-development",
    label: { ar: CATEGORY_LABELS.mobile.ar, en: CATEGORY_LABELS.mobile.en },
    description: {
      ar: "كل ما يتعلق بتطوير تطبيقات الموبايل: التكاليف، الأداء، الاختبار، واختيار التقنية المناسبة لتطبيقك.",
      en: "Everything on mobile app development: costs, performance, testing, and choosing the right technology for your app.",
    },
  },
  {
    key: "web",
    slug: "web-development",
    label: { ar: CATEGORY_LABELS.web.ar, en: CATEGORY_LABELS.web.en },
    description: {
      ar: "تطوير الويب والمتاجر الإلكترونية: تكاليف التصميم، الاستضافة، الأداء، وأمن الواجهات البرمجية.",
      en: "Web and e-commerce development: design costs, hosting, performance, and API security.",
    },
  },
  {
    key: "comparisons",
    slug: "comparisons",
    label: { ar: CATEGORY_LABELS.comparisons.ar, en: CATEGORY_LABELS.comparisons.en },
    description: {
      ar: "مقارنات محايدة بين التقنيات والخيارات الشائعة، بأطر قرار واضحة بدل التوصيات المطلقة.",
      en: "Neutral comparisons between common technologies and options, with clear decision frameworks rather than absolute recommendations.",
    },
  },
  {
    key: "selected",
    slug: "selected-topics",
    label: { ar: CATEGORY_LABELS.selected.ar, en: CATEGORY_LABELS.selected.en },
    description: {
      ar: "مواضيع متخصصة: الامتثال التنظيمي في الخليج، بوابات الدفع، التعريب، والذكاء الاصطناعي للأعمال.",
      en: "Specialised topics: Gulf regulatory compliance, payment gateways, Arabic localisation, and AI for business.",
    },
  },
  {
    key: "practical",
    slug: "practical-guides",
    label: { ar: CATEGORY_LABELS.practical.ar, en: CATEGORY_LABELS.practical.en },
    description: {
      ar: "تجارب وأدلة عملية من مشاريع حقيقية: العقود، الصيانة، إدارة المشاريع، واختيار شريك التطوير.",
      en: "Practical guides drawn from real projects: contracts, maintenance, project management, and choosing a development partner.",
    },
  },
] as const;

/** Articles per page on the blog index and category pages. */
export const POSTS_PER_PAGE = 12;

const BY_KEY = new Map(CATEGORIES.map((category) => [category.key as string, category]));
const BY_SLUG = new Map(CATEGORIES.map((category) => [category.slug, category]));

export function getCategoryByKey(key: string): Category | undefined {
  return BY_KEY.get(key);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return BY_SLUG.get(slug);
}

/**
 * Category keys for a post, filtered to keys this module actually knows about.
 * A POST_META row carrying a key that no longer exists would otherwise produce a
 * card badge linking to a 404.
 */
export function getPostCategoryKeys(slug: string): CategoryKey[] {
  return (POST_META[slug]?.categories ?? []).filter((key): key is CategoryKey =>
    BY_KEY.has(key)
  );
}

/** The category a post belongs to for breadcrumb and badge purposes. */
export function getPrimaryCategory(slug: string): Category | undefined {
  const [first] = getPostCategoryKeys(slug);
  return first ? BY_KEY.get(first) : undefined;
}

export function postHasCategory(slug: string, key: CategoryKey): boolean {
  return getPostCategoryKeys(slug).includes(key);
}

export type Paginated<T> = {
  items: T[];
  page: number;
  totalPages: number;
  totalItems: number;
};

/**
 * Slices a list for `page`, clamping to the valid range. An empty list still
 * yields one page so a category with no articles renders its empty state at
 * page 1 rather than reporting zero pages.
 */
export function paginate<T>(items: T[], page: number, perPage = POSTS_PER_PAGE): Paginated<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    page: current,
    totalPages,
    totalItems,
  };
}

/**
 * Parses a `/page/<n>` segment. Returns undefined for anything that is not a
 * plain positive integer, which the routes turn into a 404 — "page/1", "page/01"
 * and "page/2.0" would otherwise each serve duplicate content at a second URL.
 */
export function parsePageParam(value: string): number | undefined {
  if (!/^[1-9][0-9]*$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}
