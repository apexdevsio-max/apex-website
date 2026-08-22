import Link from "next/link";

import type { Locale } from "@/lib/i18n/locale";
import { CATEGORIES, type CategoryKey } from "@/lib/content/taxonomy";

/**
 * The category bar above the article grid.
 *
 * These were `<button>`s driving a `useState` filter, so selecting a category
 * changed nothing about the URL — the groupings existed for visitors but were
 * invisible to search engines, and a reader could not link to or bookmark one.
 * As links they double as the internal-linking layer that distributes authority
 * from the blog index down into each topic cluster.
 */
export function CategoryNav({
  lang,
  active,
}: {
  lang: Locale;
  /** Undefined on the "all articles" index. */
  active?: CategoryKey;
}) {
  const isAr = lang === "ar";

  const activeStyle = {
    background: "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
    borderColor: "transparent",
    color: "#fff",
    boxShadow: "0 4px 18px color-mix(in srgb,var(--color-primary) 38%,transparent)",
    transform: "translateY(-1px)",
  } as const;

  const idleStyle = {
    background: "var(--color-card)",
    borderColor: "var(--color-border)",
    color: "var(--color-secondary-text)",
  } as const;

  const className = `px-5 min-h-[44px] py-3.5 inline-flex items-center rounded-full text-sm font-bold transition-all duration-200 border ${
    isAr ? "font-ar" : "font-en"
  }`;

  return (
    <nav
      className="flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible justify-start md:justify-center gap-2 mb-10 py-1"
      aria-label={isAr ? "أقسام المدونة" : "Blog categories"}
    >
      <Link
        href={`/${lang}/blog`}
        className={className}
        style={active ? idleStyle : activeStyle}
        {...(active ? {} : { "aria-current": "page" as const })}
      >
        {isAr ? "الكل" : "All"}
      </Link>

      {CATEGORIES.map((category) => {
        const isActive = category.key === active;
        return (
          <Link
            key={category.key}
            href={`/${lang}/blog/category/${category.slug}`}
            className={className}
            style={isActive ? activeStyle : idleStyle}
            {...(isActive ? { "aria-current": "page" as const } : {})}
          >
            {category.label[lang]}
          </Link>
        );
      })}
    </nav>
  );
}
