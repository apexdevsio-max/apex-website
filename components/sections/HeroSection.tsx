"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { getRtlClasses } from "@/lib/i18n/rtl";
import { useIsDesktop } from "@/lib/hooks/useIsDesktop";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";

// Both layers are desktop-only decoration built on canvas and WebGL. Loading
// them dynamically keeps them out of the initial bundle, and `ssr: false` keeps
// their markup out of the server HTML, so a phone never parses either one.
const ParticleBackground = dynamic(
  () => import("@/components/effects/ParticleBackground").then((m) => m.ParticleBackground),
  { ssr: false },
);
const ChromaVideoBackground = dynamic(
  () => import("@/components/effects/ChromaVideoBackground").then((m) => m.ChromaVideoBackground),
  { ssr: false },
);

export function HeroSection({
  lang,
  dictionary,
}: {
  lang: Locale;
  dictionary: Dictionary;
}) {
  const rtl = getRtlClasses(lang);
  const { heroSection } = dictionary;
  const scrollLabel = lang === "ar" ? "مرر" : "SCROLL";

  const isDesktop = useIsDesktop();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { rootMargin: "200px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

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
      className="apex-hero relative flex items-center overflow-hidden"
      style={{
        backgroundImage: "none",
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

      {/* The two glow orbs below are the desktop treatment. Below md they are
          replaced by the animated .apex-hero::after gradients, so rendering both
          would stack two sets of radial gradients over the same area. */}
      <div
        className="absolute pointer-events-none z-20 hidden md:block"
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
        className="absolute pointer-events-none z-20 hidden md:block"
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

       {isDesktop ? (
         <>
           <ParticleBackground isVisible={isVisible} />
           <ChromaVideoBackground isVisible={isVisible} />
         </>
       ) : null}

       {/* On desktop the chroma-keyed video carries the visual; this still image
           is the mobile counterpart, so it is a foreground element in the flow
           rather than a 25%-opacity ghost behind the text. It sits after the
           copy in the source order (see the grid below) so the headline stays
           the first thing read and the first thing painted. */}

      <div className="relative z-50 mx-auto w-full max-w-7xl px-6 pb-16 pt-28 md:pb-16 md:pt-24 md:px-10">
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

          {/* 5.5vw never cleared the 28px floor on a phone: every width from
              320px to 509px rendered at exactly 28px, so the headline had no
              response to screen size at all. 9vw starts scaling at 356px.
              `minHeight` is gone because it was sized for the two-line desktop
              break and cropped or padded the three-line mobile wrap; the two
              spans below are block-level instead, which reserves the real height
              without guessing at it. */}
          <h1
            className={`apex-fade-up apex-delay-2 font-bold leading-[1.08] md:leading-[1.04] ${rtl.fontClass}`}
            style={{ fontSize: "clamp(34px,9vw,78px)", textWrap: "balance" }}
          >
            <span className="block" style={{ color: "var(--color-primary-text)" }}>
              {heroSection.headline}
            </span>
            <span className="apex-shimmer-text block">{heroSection.highlight}</span>
          </h1>

          <p
            className={`apex-fade-up apex-delay-3 mt-6 leading-relaxed ${rtl.fontClass}`}
            style={{
              // 1.6vw pinned every phone to the 14px floor. 4vw lets it scale,
              // and the minHeight is dropped for the same reason as the h1's.
              fontSize: "clamp(15px,4vw,17px)",
              color: "var(--color-secondary-text)",
              maxWidth: "420px",
            }}
          >
            {heroSection.subheadline}
          </p>

          {/* `flex-wrap` alone let two px-8 buttons overflow 343px of usable width
              and drop onto a second line at two different widths, which read as a
              bug. Below sm they stack full-width instead; from sm they sit inline
              as before. */}
          <div
            className={`apex-fade-up apex-delay-4 mt-9 flex flex-col sm:flex-wrap gap-3 sm:gap-4 ${
              // rtl.flexRev is `flex-row-reverse`, which would fight `flex-col`
              // and re-order the stacked buttons vertically on Arabic phones.
              // The reversal is only wanted once they sit on one row.
              lang === "ar" ? "sm:flex-row-reverse" : "sm:flex-row"
            }`}
          >
            <Link
              href={`/${lang}/portfolio`}
              className="apex-btn inline-flex w-full sm:w-auto min-h-[48px] items-center justify-center sm:justify-start gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
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
              className="hero-cta-secondary inline-flex w-full sm:w-auto min-h-[48px] items-center justify-center sm:justify-start gap-2 rounded-full border-2 px-8 py-3.5 text-sm font-bold transition-all"
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
            {/* No opacity on the tagline: at 75% the primary colour drops to
                3.86:1 on the light background, under the 4.5:1 WCAG AA floor. */}
            <span
              className={`text-xs font-semibold tracking-[0.2em] ${rtl.fontClass}`}
              style={{ color: "var(--color-primary)" }}
            >
              {heroSection.tagline}
            </span>
          </div>
        </div>

        {/* Mobile-only hero visual. Full opacity and in the document flow, so it
            reads as the subject rather than as texture behind the copy. It is
            the LCP candidate on phones, hence priority + fetchPriority. */}
        <div className="md:hidden mt-12 flex justify-center" aria-hidden="true">
          <Image
            src="/images/robot_mascot.avif"
            alt=""
            width={373}
            height={373}
            priority
            fetchPriority="high"
            quality={60}
            sizes="(max-width: 767px) 68vw, 373px"
            className="h-auto w-[68%] max-w-[300px] object-contain apex-hero-float"
          />
        </div>
      </div>

      {/* Hidden below md: the hero is no longer a locked 100svh on phones, so
          there is no fixed viewport bottom to anchor to, and it collided with
          the CTAs on short screens. */}
      <div
        className="pointer-events-none absolute bottom-7 left-1/2 z-50 hidden -translate-x-1/2 flex-col items-center gap-2 opacity-40 md:flex"
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
