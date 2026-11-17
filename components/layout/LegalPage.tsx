import type { Locale } from "@/lib/i18n/locale";
import { formatDate } from "@/lib/i18n/format";
import { LEGAL_LAST_UPDATED } from "@/lib/legal";

export type LegalSection = { heading: string; paragraphs: readonly string[] };

/** Shared layout for the privacy policy and the terms. */
export function LegalPage({ lang, title, intro, sections }: { lang: Locale; title: string; intro: string; sections: readonly LegalSection[] }) {
  const isAr = lang === "ar";
  return (
    <div className="px-6 pt-10 pb-20 md:pt-16">
      <article className="apex-prose mx-auto max-w-[72ch]">
        <h1 className="apex-page-title">{title}</h1>
        <p className="mt-3 text-sm text-apex-muted">
          {isAr ? "آخر تحديث: " : "Last updated: "}
          <time dateTime={LEGAL_LAST_UPDATED}>{formatDate(LEGAL_LAST_UPDATED, lang)}</time>
        </p>
        <p className="apex-prose-p mt-6">{intro}</p>
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="apex-prose-h2">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="apex-prose-p">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}
