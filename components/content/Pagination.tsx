import Link from "next/link";

import type { Locale } from "@/lib/i18n/locale";

/**
 * Page navigation for the blog index and category listings.
 *
 * Rendered as real `<a href>` links rather than buttons so each page is
 * crawlable: with 200 articles at 12 per page, pages 2..17 hold most of the
 * archive, and a JavaScript-driven pager would leave those articles reachable
 * only from the sitemap — indexed slowly, if at all.
 *
 * Next.js emits `rel="next"`/`rel="prev"` nothing on its own; they are set
 * explicitly below. Google no longer uses them for indexing, but Bing still
 * does, and they remain a correct description of the sequence.
 */
export function Pagination({
  lang,
  page,
  totalPages,
  basePath,
}: {
  lang: Locale;
  page: number;
  totalPages: number;
  /** Path without the /page/<n> suffix, e.g. "/en/blog" or "/en/blog/category/web". */
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const isAr = lang === "ar";

  // Page one lives at the bare path, not at /page/1 — two URLs serving the same
  // listing would split its ranking signals and duplicate the content.
  const href = (target: number) => (target === 1 ? basePath : `${basePath}/page/${target}`);

  const pages = pageWindow(page, totalPages);

  return (
    <nav
      className="mt-14 flex items-center justify-center gap-2 flex-wrap"
      aria-label={isAr ? "تصفح الصفحات" : "Pagination"}
      dir={isAr ? "rtl" : "ltr"}
    >
      {page > 1 && (
        <Link
          href={href(page - 1)}
          rel="prev"
          className="px-4 min-h-[44px] inline-flex items-center rounded-full text-sm font-bold border transition-colors"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
            color: "var(--color-secondary-text)",
          }}
        >
          {isAr ? "السابق" : "Previous"}
        </Link>
      )}

      {pages.map((entry, index) =>
        entry === "gap" ? (
          <span
            key={`gap-${index}`}
            className="px-2 select-none"
            style={{ color: "var(--color-secondary-text)" }}
            aria-hidden="true"
          >
            …
          </span>
        ) : entry === page ? (
          <span
            key={entry}
            aria-current="page"
            className="px-4 min-h-[44px] inline-flex items-center rounded-full text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
            }}
          >
            {entry}
          </span>
        ) : (
          <Link
            key={entry}
            href={href(entry)}
            className="px-4 min-h-[44px] inline-flex items-center rounded-full text-sm font-bold border transition-colors"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
              color: "var(--color-secondary-text)",
            }}
          >
            {entry}
          </Link>
        )
      )}

      {page < totalPages && (
        <Link
          href={href(page + 1)}
          rel="next"
          className="px-4 min-h-[44px] inline-flex items-center rounded-full text-sm font-bold border transition-colors"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
            color: "var(--color-secondary-text)",
          }}
        >
          {isAr ? "التالي" : "Next"}
        </Link>
      )}
    </nav>
  );
}

/**
 * The page numbers to show: always the first and last, plus a window around the
 * current page, with gaps marked. At 17 pages a full list is unusable on mobile
 * and dilutes the internal links that matter.
 */
function pageWindow(page: number, totalPages: number): Array<number | "gap"> {
  const window = new Set<number>([1, totalPages, page]);
  if (page - 1 > 1) window.add(page - 1);
  if (page + 1 < totalPages) window.add(page + 1);

  const sorted = [...window].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);

  const result: Array<number | "gap"> = [];
  let previous = 0;
  for (const current of sorted) {
    if (previous && current - previous > 1) result.push("gap");
    result.push(current);
    previous = current;
  }
  return result;
}
