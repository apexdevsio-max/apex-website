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

/*
 * Mobile-first: every unprefixed class below describes the phone layout — a
 * single centred column with the mascot on top — and `md:` layers the desktop
 * layout over it: copy in a left-hand 45% column, the chroma-keyed video and
 * particle canvas filling the right.
 */
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
    // No `size` in `contain`: size containment lays the section out as if it
    // were empty, and below md its height is content-driven (min-height: auto),
    // so it collapsed to 0px and `overflow-hidden` clipped the whole hero away
    // on every phone. Layout and paint containment are kept.
    <section
      dir="ltr"
      ref={sectionRef}
      className="apex-hero relative flex items-center overflow-hidden [contain:layout_paint]"
      aria-label="Hero"
    >
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(135deg,var(--color-background) 0%,color-mix(in srgb,var(--color-primary) 8%,var(--color-background)) 100%)",
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
          borderRadius: "50%",
          background:
            "radial-gradient(circle,color-mix(in srgb,var(--color-gold) 10%,transparent) 0%,transparent 70%)",
          contain: "layout paint size",
        }}
      />

      {/* Desktop-only watermark. In the centred mobile column it sat on top of
          the mascot, and hiding it also saves phones an image request. */}
      <div
        className="absolute z-20 pointer-events-none hidden md:block"
        style={{
          top: "10%",
          left: "6%",
          width: "min(360px,40vw)",
          height: "min(140px,16vw)",
          opacity: 0.08,
          contain: "layout paint size",
        }}
        aria-hidden="true"
      >
        <Image
          src="/images/Apex_logo.png"
          alt={lang === "ar" ? "أبيكس — شركة تطوير برمجيات في الخليج" : "Apex — Software Development Company in the Gulf"}
          width={360}
          height={140}
          sizes="360px"
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

      <div className="relative z-50 mx-auto flex w-full max-w-7xl flex-col px-5 pb-14 pt-24 sm:px-8 md:px-10 md:pb-16">
        <div
          dir={rtl.dirAttr}
          className="flex flex-col items-center text-center md:mr-auto md:w-full md:max-w-[45%] md:items-start md:text-start"
        >
          <div
            className="apex-fade-up apex-delay-1 mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 md:mb-6"
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

          {/* The two spans are block-level so the headline always breaks into
              the same two lines and reserves its real height without a guessed
              minHeight. 10vw clears the 36px floor from 360px up. */}
          <h1
            className={`apex-fade-up apex-delay-2 font-bold leading-[1.1] text-[clamp(36px,10vw,78px)] md:leading-[1.04] md:text-[clamp(34px,9vw,78px)] ${rtl.fontClass}`}
            style={{ textWrap: "balance" }}
          >
            <span className="block" style={{ color: "var(--color-primary-text)" }}>
              {heroSection.headline}
            </span>
            <span className="apex-shimmer-text block">{heroSection.highlight}</span>
          </h1>

          <p
            className={`apex-fade-up apex-delay-3 mt-4 max-w-[420px] leading-relaxed text-[clamp(15px,4vw,17px)] md:mt-6 ${rtl.fontClass}`}
            style={{ color: "var(--color-secondary-text)", textWrap: "balance" }}
          >
            {heroSection.subheadline}
          </p>

          {/* Stacked full-width on phones: two px-8 buttons side by side don't
              fit 320–400px screens. From sm they sit on one row, which follows
              the column's `dir`, so in Arabic the primary CTA leads on the right. */}
          <div className="apex-fade-up apex-delay-4 mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 md:mt-9 md:justify-start">
            <Link
              href={`/${lang}/portfolio`}
              className="apex-btn inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-bold text-white transition-transform active:scale-[0.98] sm:min-h-[48px] sm:w-auto sm:text-sm md:hover:-translate-y-0.5"
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
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border-2 px-8 py-3.5 text-[15px] font-bold transition-all hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] active:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] sm:min-h-[48px] sm:w-auto sm:text-sm"
              style={{
                color: "var(--color-primary)",
                borderColor: "var(--color-primary)",
              }}
            >
              {heroSection.ctaSecondary}
            </Link>
          </div>

          {/* The tagline is Latin in both locales, so the row is always LTR: a
              rule fading out on each side of it while the column is centred,
              and only the leading rule once it is start-aligned at md. */}
          <div dir="ltr" className="apex-fade-up apex-delay-5 mt-8 flex items-center gap-3 md:mt-12">
            <span
              className="h-px w-7 md:w-10"
              style={{ background: "linear-gradient(to left,var(--color-primary),transparent)" }}
            />
            {/* No opacity on the tagline: at 75% the primary colour drops to
                3.86:1 on the light background, under the 4.5:1 WCAG AA floor. */}
            <span
              className="font-en text-xs font-semibold tracking-[0.2em]"
              style={{ color: "var(--color-primary)" }}
            >
              {heroSection.tagline}
            </span>
            <span
              className="h-px w-7 md:hidden"
              style={{ background: "linear-gradient(to right,var(--color-primary),transparent)" }}
            />
          </div>
        </div>

        {/* Mobile hero visual: the counterpart of the desktop video. It comes
            after the copy in the source so the headline is read first, and
            `order-first` lifts it to the top of the column visually. It is the
            LCP candidate on phones, hence priority + fetchPriority and no
            opacity fade-in. Sized against svh as well so short phones keep the
            CTAs above the fold. */}
        <div
          className="relative order-first mb-6 self-center md:hidden"
          aria-hidden="true"
        >
          <div
            className="absolute -inset-[14%] rounded-full"
            style={{
              background:
                "radial-gradient(circle,color-mix(in srgb,var(--color-primary) 22%,transparent) 0%,transparent 68%)",
            }}
          />
          <div
            className="absolute inset-[6%] rounded-full border"
            style={{
              borderColor: "color-mix(in srgb,var(--color-primary) 18%,transparent)",
            }}
          />
          <Image
            src="/images/robot_mascot.avif"
            alt=""
            width={373}
            height={373}
            priority
            fetchPriority="high"
            quality={60}
            sizes="240px"
            className="relative h-auto w-[min(58vw,240px,30svh)] object-contain apex-hero-float [mask-image:linear-gradient(to_bottom,black_72%,transparent)]"
          />
        </div>
      </div>

      {/* Hidden below md: the hero is not a locked 100svh on phones, so there
          is no fixed viewport bottom to anchor to. */}
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
  );
}
