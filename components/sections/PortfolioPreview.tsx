import Link from "next/link";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectCard } from "@/components/content/ProjectCard";
import { getPortfolioItems } from "@/lib/content/content-loader";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";

/** The software case study leads; the media work follows. */
const FEATURED_ORDER = [
  "tafawwoq-educational-app",
  "wifaq-qatar-ai",
  "dental-clinic-motion",
  "tajweed-kids-ai",
  "jewelry-showcase",
  "arnoub-adventure-ai",
];

export async function PortfolioPreview({ lang, copy }: { lang: Locale; copy: Dictionary["portfolio"] }) {
  const items = await getPortfolioItems(lang);
  const bySlug = new Map(items.map((item) => [item.slug, item] as const));
  const [lead, ...rest] = FEATURED_ORDER.map((slug) => bySlug.get(slug)).filter((item) => item !== undefined);

  return (
    <section id="portfolio" className="apex-section">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow={copy.badge} title={copy.title} subtitle={copy.subtitle} />
        {/* The lead project spans two columns so the grid is not six identical tiles. */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lead && (
            <div className="sm:col-span-2 lg:row-span-2">
              <ProjectCard project={lead} lang={lang} />
            </div>
          )}
          {rest.slice(0, 4).map((project) => (
            <ProjectCard key={project.slug} project={project} lang={lang} />
          ))}
        </div>
        <Link href={`/${lang}/portfolio`} className="apex-btn-primary mt-10">
          {copy.viewAll}
        </Link>
      </div>
    </section>
  );
}
