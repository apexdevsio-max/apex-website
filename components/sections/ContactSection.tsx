// file: components/sections/ContactSection.tsx
"use client";

import { Mail, MessageCircle } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";
import { Reveal } from "@/components/ui/Reveal";

type Props = {
  lang: Locale;
  dictionary: Dictionary;
  email: string;
  whatsapp: string;
};

export function ContactSection({ lang, dictionary, email, whatsapp }: Props) {
  const isAr = lang === "ar";
  const { contact } = dictionary;

  return (
    <section
      id="contact"
      className="relative py-28 md:py-36 px-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--color-background) 88%, var(--color-primary)), color-mix(in srgb, var(--color-background) 92%, var(--color-gold)))",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in srgb, var(--color-primary) 9%, transparent) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: 0.6,
        }}
        aria-hidden="true"
      />

      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          top: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-1 max-w-3xl mx-auto text-center">
        <Reveal>
          <span className="apex-section-label">{contact.badge}</span>
          <div className="apex-divider" />
          <h2
            className={`mt-5 font-bold leading-tight ${isAr ? "font-ar" : "font-en"}`}
            style={{ fontSize: "clamp(26px, 3.8vw, 48px)", color: "var(--color-primary-text)" }}
          >
            {contact.title}
          </h2>
          <p
            className={`mt-4 mx-auto leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
            style={{
              maxWidth: "480px",
              fontSize: "clamp(14px, 1.5vw, 16px)",
              color: "var(--color-secondary-text)",
            }}
          >
            {contact.description}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="grid sm:grid-cols-2 gap-5 mt-14 mb-10">
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="apex-btn apex-card-hover flex flex-col items-center gap-3 rounded-2xl p-8 text-white font-bold transition-transform hover:-translate-y-1"
              style={{
                background: "linear-gradient(135deg, #25D366, #128C7E)",
                boxShadow: "0 10px 32px rgba(37,211,102,0.28)",
                border: "none",
              }}
            >
              <MessageCircle size={38} strokeWidth={1.5} />
              <span className={`text-base ${isAr ? "font-ar" : "font-en"}`}>{contact.whatsapp}</span>
              <span className="text-sm opacity-80">{whatsapp}</span>
            </a>

            <a
              href={`mailto:${email}`}
              className="apex-btn apex-card-hover flex flex-col items-center gap-3 rounded-2xl p-8 text-white font-bold transition-transform hover:-translate-y-1"
              style={{
                background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-light))",
                boxShadow: "0 10px 32px color-mix(in srgb, var(--color-primary) 35%, transparent)",
                border: "none",
              }}
            >
              <Mail size={38} strokeWidth={1.5} />
              <span className={`text-base ${isAr ? "font-ar" : "font-en"}`}>{contact.email}</span>
              <span className="text-sm opacity-80">{email}</span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={220}>
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full border"
            style={{
              background: "color-mix(in srgb, var(--color-gold) 12%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-gold) 38%, transparent)",
            }}
          >
            <span className="apex-online-dot" />
            <span
              className={`text-sm font-semibold ${isAr ? "font-ar" : "font-en"}`}
              style={{ color: "var(--color-gold)" }}
            >
              {contact.available}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
