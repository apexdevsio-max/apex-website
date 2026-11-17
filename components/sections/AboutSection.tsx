import Link from "next/link";
import { Check } from "lucide-react";

import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";

/**
 * Home "about" block. The figures are counted from the content folders at build
 * time; they used to be typed into the dictionary and disagreed with the
 * portfolio page ("9 documented projects" when there were 8, "24+" elsewhere).
 */
export function AboutSection({
  lang,
  about,
  counts,
}: {
  lang: Locale;
  about: Dictionary["about"];
  counts: { projects: number; services: number; articles: number };
}) {
  const stats = [
    { value: counts.projects, label: about.statsLabels.projects },
    { value: counts.services, label: about.statsLabels.services },
    { value: counts.articles, label: about.statsLabels.articles },
    { value: 2, label: about.statsLabels.languages },
  ];

  return (
    <section id="about" className="apex-section">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-16">
          <div>
            <SectionHeader eyebrow={about.badge} title={about.title} subtitle={about.subtitle} />
            <p className="text-lg leading-relaxed text-apex-muted">{about.description}</p>
            <ul className="mt-6 grid gap-3">
              {about.checks.map((item) => (
                <li key={item} className="flex items-start gap-3 text-base font-bold text-apex-text">
                  <Check size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-apex-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={`/${lang}/about`} className="apex-btn-outline mt-8">
              {lang === "ar" ? "المزيد عنّا" : "More about us"}
            </Link>
          </div>

          <div className="flex flex-col gap-6">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-apex-border bg-apex-border">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse gap-1 bg-apex-bg p-6">
                  <dt className="text-sm text-apex-muted">{stat.label}</dt>
                  <dd className="apex-stat">{stat.value}</dd>
                </div>
              ))}
            </dl>
            <div className="rounded-2xl border border-apex-border bg-apex-card p-6 md:p-8">
              <h3 className="text-lg font-bold text-apex-text">{about.visionTitle}</h3>
              <p className="mt-2 text-base leading-relaxed text-apex-muted">{about.visionText}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
