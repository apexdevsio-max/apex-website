import Image from "next/image";
import Link from "next/link";

import { getPortfolioItems } from "@/lib/content/content-loader";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";
import { Reveal } from "@/components/ui/Reveal";

// The homepage previously rendered six invented projects from the dictionary as
// emoji tiles, while nine real, documented projects with actual screenshots sat in
// content/projects. Visitors judging the company by its landing page saw
// placeholder art instead of the work itself. This now reads the same source the
// /portfolio page does, so the preview can never drift from the real catalogue.
const FEATURED_COUNT = 6;

// Category labels are editorial, not part of the MDX frontmatter, so they live here
// keyed by slug. A project without an entry still renders — it just falls back to a
// generic label rather than being dropped from the preview.
const CATEGORY_BY_SLUG: Record<string, { ar: string; en: string }> = {
  "tafawwoq-educational-app": { ar: "تطبيق موبايل", en: "Mobile App" },
  "wifaq-qatar-ai": { ar: "محتوى ذكاء اصطناعي", en: "AI Content" },
  "tajweed-kids-ai": { ar: "محتوى تعليمي", en: "Educational Content" },
  "arnoub-adventure-ai": { ar: "محتوى ذكاء اصطناعي", en: "AI Content" },
  "fatiha-family-ai": { ar: "محتوى ذكاء اصطناعي", en: "AI Content" },
  "dental-clinic-motion": { ar: "موشن جرافيك", en: "Motion Graphics" },
  "esthetic-clinic-reels": { ar: "محتوى تسويقي", en: "Marketing Content" },
  "jewelry-showcase": { ar: "إنتاج بصري", en: "Visual Production" },
};

// Ordered so the strongest engineering case study leads. `tafawwoq` is a full
// Flutter product; the AI/media work follows.
const FEATURED_ORDER = [
  "tafawwoq-educational-app",
  "wifaq-qatar-ai",
  "tajweed-kids-ai",
  "jewelry-showcase",
  "dental-clinic-motion",
  "arnoub-adventure-ai",
];

function orderProjects<T extends { slug: string }>(items: T[]): T[] {
  const bySlug = new Map(items.map((item) => [item.slug, item] as const));
  const ordered = FEATURED_ORDER.map((slug) => bySlug.get(slug)).filter(
    (item): item is T => Boolean(item)
  );
  const rest = items.filter((item) => !FEATURED_ORDER.includes(item.slug));
  return [...ordered, ...rest].slice(0, FEATURED_COUNT);
}

export async function PortfolioPreview({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary;
}) {
  const isAr = lang === "ar";
  const { portfolio } = dictionary;
  const projects = orderProjects(await getPortfolioItems(lang));

  return (
    <section
      id="portfolio"
      className="relative py-16 md:py-36 px-6 apex-section-alt"
    >
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="apex-section-label">{portfolio.badge}</span>
          <div className="apex-divider" />
          <h2
            className={`mt-5 font-bold leading-tight ${isAr ? "font-ar" : "font-en"}`}
            style={{ fontSize: "clamp(26px, 3.8vw, 48px)", color: "var(--color-primary-text)" }}
          >
            {portfolio.title}
          </h2>
          <p
            className={`mt-4 mx-auto leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
            style={{ maxWidth: "520px", fontSize: "clamp(14px, 1.5vw, 16px)", color: "var(--color-secondary-text)" }}
          >
            {portfolio.subtitle}
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {projects.map((project, index) => {
            const thumbnail = project.thumbnail ?? project.images?.[0];
            const category = CATEGORY_BY_SLUG[project.slug]?.[lang];

            return (
              <Reveal key={project.slug} delay={index * 70}>
                <Link
                  href={`/${lang}/portfolio/${project.slug}`}
                  className="apex-card-base apex-card-hover rounded-2xl overflow-hidden flex flex-col h-full"
                  dir={isAr ? "rtl" : "ltr"}
                >
                  <div
                    className="relative overflow-hidden"
                    style={{ height: "176px", background: "var(--color-card)" }}
                  >
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt={project.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                        quality={60}
                        loading="lazy"
                      />
                    ) : null}
                  </div>

                  <div className="p-4 md:p-6 flex flex-col flex-1">
                    {category ? (
                      <span
                        className={`block text-[11px] font-semibold tracking-wider mb-1 ${isAr ? "font-ar" : "font-en"}`}
                        style={{ color: "var(--color-secondary-text)" }}
                      >
                        {category}
                      </span>
                    ) : null}
                    <h3
                      className={`font-bold mb-2 ${isAr ? "font-ar" : "font-en"}`}
                      style={{ fontSize: "15px", color: "var(--color-primary-text)" }}
                    >
                      {project.title}
                    </h3>
                    <p
                      className={`mb-4 flex-1 leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
                      style={{ fontSize: "13px", color: "var(--color-secondary-text)" }}
                    >
                      {project.summary}
                    </p>
                    <div
                      className={`flex items-center gap-2 font-semibold text-sm apex-arrow ${isAr ? "font-ar flex-row-reverse justify-end" : ""}`}
                      style={{ color: "var(--color-primary)" }}
                    >
                      {portfolio.viewProject}
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="text-center">
          <Link
            href={`/${lang}/portfolio`}
            className="apex-btn apex-btn-primary apex-arrow inline-flex items-center gap-3 px-10 py-3.5 rounded-full font-bold text-sm text-white"
          >
            {portfolio.viewAll}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
