import type { Locale } from "@/lib/i18n/locale";
import type { TocEntry } from "@/lib/content/headings";

/**
 * In-article navigation, server-rendered so it is in the HTML crawlers read.
 * On phones it is a collapsed <details>, so it no longer pushes the article
 * 400px down; from `lg` it sits in a sticky side column. Only `##` headings.
 */
export function TableOfContents({ entries, lang }: { entries: TocEntry[]; lang: Locale }) {
  const isAr = lang === "ar";
  const top = entries.filter((entry) => entry.level === 2);
  if (top.length < 4) return null;

  const title = isAr ? "محتويات المقال" : "In this article";
  const list = (
    <ol className="apex-toc-list">
      {top.map((entry) => (
        <li key={entry.id}>
          <a href={`#${entry.id}`} className="apex-toc-link">
            {/* The list already numbers entries; drop a heading's own "1." prefix. */}
            {entry.text.replace(/^[0-9٠-٩]+[.)\-]\s*/, "")}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <details className="mb-8 rounded-2xl border border-apex-border bg-apex-card lg:hidden">
        <summary className="flex min-h-[48px] cursor-pointer items-center px-5 font-bold text-apex-text">{title}</summary>
        <nav aria-label={title} className="px-5 pb-5">
          {list}
        </nav>
      </details>
      <nav aria-label={title} className="hidden lg:block lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
        <p className="mb-3 text-sm font-bold text-apex-text">{title}</p>
        {list}
      </nav>
    </>
  );
}
