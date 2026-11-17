"use client";

import Link from "next/link";
import { useDeferredValue, useId, useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { Locale } from "@/lib/i18n/locale";

export type SearchEntry = { slug: string; title: string; excerpt: string; category: string };

/**
 * Normalises text for matching: case, diacritics, tatweel and the common
 * hamza/alef, alef maqsura and taa marbuta variants, so "الامتثال" finds "الإمتثال".
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[آأإ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Searches every article's title, excerpt and category in the browser. The index
 * is a few kilobytes, so there is no server round trip.
 */
export function BlogSearch({ lang, entries }: { lang: Locale; entries: SearchEntry[] }) {
  const isAr = lang === "ar";
  const id = useId();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const indexed = useMemo(
    () => entries.map((entry) => ({ entry, haystack: normalize(`${entry.title} ${entry.excerpt} ${entry.category}`) })),
    [entries]
  );

  const terms = normalize(deferred).split(/\s+/).filter(Boolean);
  const results =
    terms.length === 0
      ? []
      : indexed.filter(({ haystack }) => terms.every((term) => haystack.includes(term))).map(({ entry }) => entry);

  const summary =
    results.length === 0
      ? isAr
        ? "لا توجد نتائج. جرّب كلمة أخرى."
        : "No matching articles. Try another word."
      : isAr
        ? `عدد النتائج: ${results.length}`
        : `${results.length} ${results.length === 1 ? "result" : "results"}`;

  return (
    <div className="mb-10" role="search">
      <label htmlFor={id} className="sr-only">
        {isAr ? "ابحث في المقالات" : "Search articles"}
      </label>
      <div className="relative max-w-xl">
        <Search size={18} aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-4 my-auto text-apex-muted" />
        <input
          id={id}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={isAr ? "ابحث في المقالات، مثلاً: تكلفة تطبيق" : "Search articles, e.g. app cost"}
          className="min-h-[48px] w-full rounded-full border border-apex-control bg-apex-bg py-3 ps-11 pe-4 text-base text-apex-text focus:border-apex-primary"
          autoComplete="off"
        />
      </div>
      {terms.length > 0 && (
        <div className="mt-4" aria-live="polite">
          <p className="mb-3 text-sm text-apex-muted">{summary}</p>
          <ul className="grid gap-2">
            {results.slice(0, 20).map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/${lang}/blog/${entry.slug}`}
                  className="block rounded-xl border border-apex-border bg-apex-card p-4 hover:border-apex-primary"
                >
                  <span className="block font-bold text-apex-text">{entry.title}</span>
                  <span className="mt-1 block text-sm text-apex-muted line-clamp-2">{entry.excerpt}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
