import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Dictionary } from "@/lib/i18n/i18n-types";

/**
 * Proof points the visitor can verify. This was labelled "Client Testimonials"
 * in English while containing the company's own claims; the Arabic version was
 * already honest and both now say the same thing.
 */
export function WhyApex({ copy }: { copy: Dictionary["whyApex"] }) {
  return (
    <section id="why-apex" className="apex-section apex-section-alt">
      <div className="mx-auto max-w-6xl">
        <SectionHeader eyebrow={copy.badge} title={copy.title} subtitle={copy.subtitle} />
        <ol className="grid gap-6 md:grid-cols-3">
          {copy.items.map((item, index) => (
            <li key={item.title} className="relative border-t-2 border-apex-primary pt-6">
              <span aria-hidden="true" className="apex-stat block">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-xl font-bold text-apex-text">{item.title}</h3>
              <p className="mt-1 text-sm font-bold text-apex-muted">{item.source}</p>
              <p className="mt-3 text-base leading-relaxed text-apex-muted">{item.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
