
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";
import { Reveal } from "@/components/ui/Reveal";

export function ServicesSection({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary;
}) {
  const isAr = lang === "ar";
  const { services } = dictionary;

  return (
    <section id="services" className="relative py-28 md:py-36 px-6 apex-section-alt">
      <div className="max-w-6xl mx-auto">
        <Reveal className="text-center mb-16">
          <span className="apex-section-label gold">{services.badge}</span>
          <div className="apex-divider reverse" />
          <h2
            className={`mt-5 font-bold leading-tight ${isAr ? "font-ar" : "font-en"}`}
            style={{ fontSize: "clamp(26px, 3.8vw, 48px)", color: "var(--color-primary-text)" }}
          >
            {services.title}
          </h2>
          <p
            className={`mt-4 mx-auto leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
            style={{
              maxWidth: "520px",
              fontSize: "clamp(14px, 1.5vw, 16px)",
              color: "var(--color-secondary-text)",
            }}
          >
            {services.subtitle}
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.items.map((item: { icon: string; title: string; description: string }, i: number) => (
            <Reveal key={i} delay={i * 80}>
              <div
                className="apex-card-base apex-card-hover group relative rounded-2xl p-8 h-full flex flex-col"
                style={{ overflow: "hidden" }}
              >
                <div
                  className="absolute top-0 end-0 w-20 h-20 rounded-bs-full pointer-events-none"
                  style={{ background: "color-mix(in srgb, var(--color-primary) 7%, transparent)" }}
                  aria-hidden="true"
                />

                <div className="text-4xl mb-5" aria-hidden="true">
                  {item.icon}
                </div>

                <h3
                  className={`font-bold mb-3 ${isAr ? "font-ar" : "font-en"}`}
                  style={{ fontSize: "clamp(15px, 1.6vw, 18px)", color: "var(--color-primary-text)" }}
                >
                  {item.title}
                </h3>

                <p
                  className={`leading-relaxed flex-1 ${isAr ? "font-ar" : "font-en"}`}
                  style={{ fontSize: "13px", color: "var(--color-secondary-text)" }}
                >
                  {item.description}
                </p>

                <div className="mt-5 flex items-center gap-2 font-semibold text-sm apex-arrow apex-arrow-group" style={{ color: "var(--color-primary)" }}>
                  {services.learnMore}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
