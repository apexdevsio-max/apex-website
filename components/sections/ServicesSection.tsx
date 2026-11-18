import Link from "next/link";

import { SectionHeader } from "@/components/ui/SectionHeader";
import type { ServiceItem } from "@/lib/content/content-loader";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";
import { ServiceIcon } from "@/lib/content/service-style";

/**
 * Home services. Every card links to its service page; the old cards showed a
 * "Learn more" arrow but were plain <div>s, and two of the six had no page.
 */
export function ServicesSection({
  lang,
  copy,
  services,
  headingLevel = "h3",
}: {
  lang: Locale;
  copy: Dictionary["services"];
  services: ServiceItem[];
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <section id="services" className="apex-section apex-section-alt">
      <div className="mx-auto max-w-6xl">
        {copy.title && <SectionHeader eyebrow={copy.badge} title={copy.title} subtitle={copy.subtitle} />}
        <ul className="grid gap-5 md:grid-cols-2">
          {services.map((service, index) => {
            return (
              <li key={service.slug}>
                <article className="apex-card group relative flex h-full gap-5 p-6 md:p-8">
                  <span aria-hidden="true" className="apex-icon-tile">
                    <ServiceIcon slug={service.slug} size={26} strokeWidth={1.6} />
                  </span>
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-apex-muted tabular-nums">{String(index + 1).padStart(2, "0")}</p>
                    <Heading className="mt-1 text-xl font-bold text-apex-text">
                      <Link href={`/${lang}/services/${service.slug}`} className="apex-stretched-link">
                        {service.title}
                      </Link>
                    </Heading>
                    <p className="mt-2 text-base leading-relaxed text-apex-muted">{service.summary}</p>
                    <p className="apex-link-arrow mt-4 text-sm font-bold text-apex-primary">{copy.learnMore}</p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
        {copy.title && (
          <Link href={`/${lang}/services`} className="apex-btn-outline mt-10">
            {copy.allServices}
          </Link>
        )}
      </div>
    </section>
  );
}
