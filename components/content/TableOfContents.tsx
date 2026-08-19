import type { Locale } from "@/lib/i18n/locale";
import type { TocEntry } from "@/lib/content/headings";

/**
 * In-article navigation for long guides.
 *
 * Rendered as a plain `<nav>` of anchors — no client JavaScript — so it is in the
 * static HTML that crawlers read. That matters beyond usability: Google builds
 * the "jump to" links shown under a search result from a page's heading anchors,
 * which these articles previously had no way to earn.
 *
 * Only `##` headings are listed. Several articles carry a dozen `###`
 * sub-headings, and including them turns a scannable index into a second article.
 */
export function TableOfContents({
  entries,
  lang,
}: {
  entries: TocEntry[];
  lang: Locale;
}) {
  const isAr = lang === "ar";
  const top = entries.filter((entry) => entry.level === 2);

  // A three-item index for a short article is noise — the reader can see the
  // whole page. The section earns its space only on genuinely long guides.
  if (top.length < 4) return null;

  return (
    <nav
      aria-labelledby="toc-heading"
      className="mb-12 rounded-2xl border p-5 md:p-6"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
    >
      <h2
        id="toc-heading"
        className={`mb-4 text-sm font-bold ${isAr ? "font-ar" : "font-en"}`}
        style={{ color: "var(--color-primary-text)" }}
      >
        {isAr ? "محتويات المقال" : "In this article"}
      </h2>
      <ol className={`apex-toc-list ${isAr ? "font-ar" : "font-en"}`}>
        {top.map((entry) => (
          <li key={entry.id}>
            <a href={`#${entry.id}`} className="apex-toc-link">
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
