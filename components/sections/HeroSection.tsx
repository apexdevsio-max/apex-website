"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { useRtl } from "@/hooks/useRtl";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";
import { ParticleBackground } from "@/components/effects/ParticleBackground";
import { ChromaVideoBackground } from "@/components/effects/ChromaVideoBackground";

export function HeroSection({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary;
}) {
  const rtl = useRtl(lang);
  const { heroSection } = dictionary;
  const scrollLabel = lang === "ar" ? "مرر" : "SCROLL";

  const sectionRef = useRef<HTMLElement>(null);

  return (
    <>
      <style>{`
        @media (hover: hover) {
          .hero-cta-secondary:hover {
            background: color-mix(in srgb, var(--color-primary) 10%, transparent);
          }
        }
        @media (hover: none) {
          .hero-cta-secondary:active {
            background: color-mix(in srgb, var(--color-primary) 15%, transparent);
          }
        }
      `}</style>
      <section
        dir="ltr"
        ref={sectionRef}
      className="relative flex items-center overflow-hidden"
      style={{
        backgroundImage: "none",
        minHeight: "100svh",
        height: "auto",
        contain: "layout paint size",
      }}
      aria-label="Hero"
    >
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(135deg,var(--color-background) 0%,color-mix(in srgb,var(--color-primary) 8%,var(--color-background)) 100%)",
          backgroundImage: "none",
        }}
      />

      <div
        className="absolute pointer-events-none z-20"
        aria-hidden="true"
        style={{
          top: "5%",
          right: "2%",
          width: "min(560px,50vw)",
          height: "min(560px,50vw)",
          aspectRatio: "1/1",
          borderRadius: "50%",
          background:
            "radial-gradient(circle,color-mix(in srgb,var(--color-primary) 14%,transparent) 0%,transparent 70%)",
          contain: "layout paint size",
        }}
      />

      <div
        className="absolute pointer-events-none z-20"
        aria-hidden="true"
        style={{
          bottom: "0",
          left: "45%",
          width: "min(380px,40vw)",
          height: "min(380px,40vw)",
          aspectRatio: "1/1",
          borderRadius: "50%",
          background:
            "radial-gradient(circle,color-mix(in srgb,var(--color-gold) 10%,transparent) 0%,transparent 70%)",
          contain: "layout paint size",
        }}
      />

      <div
        className="absolute z-20 pointer-events-none"
        style={{
          top: "10%",
          left: "6%",
          width: "min(360px,40vw)",
          height: "min(140px,16vw)",
          aspectRatio: "360/140",
          opacity: 0.08,
          filter: "blur(0.2px)",
          contain: "layout paint size",
        }}
        aria-hidden="true"
      >
           <Image
              src="/images/Apex_logo.png"
              alt={lang === "ar" ? "أبيكس — شركة تطوير برمجيات في الخليج" : "Apex — Software Development Company in the Gulf"}
              width={360}
              height={140}
             sizes="(max-width: 768px) 40vw, 360px"
             className="object-contain"
             loading="lazy"
             quality={50}
           />
      </div>

       <ParticleBackground isVisible={true} />
       <ChromaVideoBackground isVisible={true} />

       <div
        className="absolute bottom-0 inset-e-0 z-40 w-[55%] pointer-events-none opacity-25 md:hidden"
        style={{
          aspectRatio: "1/1",
          maxHeight: "50vh",
          contain: "layout paint size",
        }}
        aria-hidden="true"
      >
          <Image
             src="/images/robot_mascot.avif"
             alt={lang === "ar" ? "مساعد أبيكس الذكي — حلول البرمجيات الذكية" : "Apex AI Assistant — Intelligent Software Solutions"}
             width={373}
            height={373}
            priority
            fetchPriority="high"
            quality={60}
            sizes="(max-width: 768px) 55vw, 25vw"
            className="object-contain object-bottom"
            style={{ contain: "layout paint size" }}
          />
      </div>

      <div className="relative z-50 mx-auto w-full max-w-7xl px-6 pb-24 md:pb-16 pt-24 md:px-10">
        <div
          dir={rtl.dirAttr}
          className={`${rtl.textAlign} md:max-w-[45%]`}
          style={{ marginRight: "auto" }}
        >
          <div
            className="apex-fade-up apex-delay-1 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{
              background:
                "color-mix(in srgb,var(--color-primary) 12%,transparent)",
              borderColor:
                "color-mix(in srgb,var(--color-primary) 35%,transparent)",
            }}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                background: "var(--color-primary)",
                boxShadow: "0 0 10px var(--color-primary)",
                animation: "apex-dot-blink 2.5s ease-in-out infinite",
              }}
            />
            <span
              className={`text-xs font-bold tracking-widest ${rtl.fontClass}`}
              style={{ color: "var(--color-primary)" }}
            >
              {heroSection.badge}
            </span>
          </div>

          <h1
            className={`apex-fade-up apex-delay-2 font-bold leading-[1.04] ${rtl.fontClass}`}
            style={{
              fontSize: "clamp(28px,5.5vw,78px)",
              minHeight: "clamp(84px,18vw,180px)",
            }}
          >
            <span style={{ color: "var(--color-primary-text)" }}>
              {heroSection.headline}{" "}
            </span>
            <br />
            <span className="apex-shimmer-text">{heroSection.highlight}</span>
          </h1>

          <p
            className={`apex-fade-up apex-delay-3 mt-6 leading-relaxed ${rtl.fontClass}`}
            style={{
              fontSize: "clamp(14px,1.6vw,17px)",
              color: "var(--color-secondary-text)",
              maxWidth: "420px",
              minHeight: "clamp(48px,7vw,72px)",
            }}
          >
            {heroSection.subheadline}
          </p>

          <div className={`apex-fade-up apex-delay-4 mt-10 flex flex-wrap gap-4 ${rtl.flexRev}`}>
            <Link
              href={`/${lang}/portfolio`}
              className="apex-btn inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              style={{
                background:
                  "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
                boxShadow:
                  "0 8px 28px color-mix(in srgb,var(--color-primary) 42%,transparent)",
              }}
            >
              {heroSection.cta}
              <span className={`${rtl.arrowRotate} inline-block`}>→</span>
            </Link>

            <Link
              href={`/${lang}/contact`}
              className="hero-cta-secondary inline-flex items-center gap-2 rounded-full border-2 px-8 py-3.5 text-sm font-bold transition-all"
              style={{
                color: "var(--color-primary)",
                borderColor: "var(--color-primary)",
                background: "transparent",
              }}
            >
              {heroSection.ctaSecondary}
            </Link>
          </div>

          <div className={`apex-fade-up apex-delay-5 mt-12 flex items-center gap-3 ${rtl.flexRev}`}>
            <div
              style={{
                height: "1px",
                width: "40px",
                background: `linear-gradient(${rtl.gradientDir},var(--color-primary),transparent)`,
              }}
            />
            <span
              className={`text-xs font-semibold tracking-[0.2em] opacity-75 ${rtl.fontClass}`}
              style={{ color: "var(--color-primary)" }}
            >
              {heroSection.tagline}
            </span>
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-7 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 opacity-40"
        aria-hidden="true"
      >
        <span
          className={`text-[10px] font-semibold tracking-[0.2em] ${rtl.fontClass}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          {scrollLabel}
        </span>
        <div
          style={{
            width: "1px",
            height: "36px",
            background: "linear-gradient(to bottom,var(--color-primary),transparent)",
          }}
        />
      </div>
    </section>
    </>
  );
}