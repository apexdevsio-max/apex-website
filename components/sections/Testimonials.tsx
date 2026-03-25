
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";
import { Reveal } from "@/components/ui/Reveal";

export function Testimonials({ lang, dictionary }: { lang: Locale; dictionary: Dictionary }) {
  const isAr = lang === "ar";
  const { testimonials } = dictionary;

  return (
    <section
      id="testimonials"
      className="relative py-28 md:py-36 px-6 overflow-hidden apex-section-alt"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 60%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto relative z-1">
        <Reveal className="text-center mb-16">
          <span className="apex-section-label gold">{testimonials.badge}</span>
          <div className="apex-divider reverse" />
          <h2
            className={`apex-section-title mt-5 font-bold leading-tight ${isAr ? "font-ar" : "font-en"}`}
          >
            {testimonials.title}
          </h2>
          <p
            className={`apex-section-subtitle mt-4 mx-auto leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
            style={{ maxWidth: "480px" }}
          >
            {testimonials.subtitle}
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.items.map(
            (item: { name: string; role: string; text: string; initial: string }, i: number) => (
              <Reveal key={i} delay={i * 100}>
                <div
                  className="apex-card-base apex-card-hover relative rounded-2xl p-8 h-full flex flex-col"
                  dir={isAr ? "rtl" : "ltr"}
                >
                  <div
                    className="absolute text-[72px] leading-none font-serif select-none pointer-events-none"
                    style={{
                      top: "10px",
                      insetInlineEnd: "16px",
                      color: "var(--color-primary)",
                      opacity: 0.09,
                    }}
                    aria-hidden="true"
                  >
                    "
                  </div>

                  <div className="flex gap-1 mb-5" aria-label="5 stars">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span key={j} style={{ color: "var(--color-gold)", fontSize: "16px" }}>★</span>
                    ))}
                  </div>

                  <p
                    className={`leading-relaxed flex-1 italic mb-7 ${isAr ? "font-ar" : "font-en"}`}
                    style={{ fontSize: "13px", color: "var(--color-secondary-text)" }}
                  >
                    {item.text}
                  </p>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-base text-white"
                      style={{
                        background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                      }}
                      aria-hidden="true"
                    >
                      {item.initial}
                    </div>
                    <div>
                      <div
                        className={`font-bold text-sm ${isAr ? "font-ar" : "font-en"}`}
                        style={{ color: "var(--color-primary-text)" }}
                      >
                        {item.name}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${isAr ? "font-ar" : "font-en"}`}
                        style={{ color: "var(--color-secondary-text)" }}
                      >
                        {item.role}
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          )}
        </div>
      </div>
    </section>
  );
}
