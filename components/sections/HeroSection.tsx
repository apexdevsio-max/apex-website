"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useIsDesktop } from "@/lib/hooks/useIsDesktop";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";

// Both layers are desktop-only decoration built on canvas and WebGL. Loading
// them dynamically keeps them out of the initial bundle, and `ssr: false` keeps
// their markup out of the server HTML, so a phone never parses either one.
const ParticleBackground = dynamic(
  () => import("@/components/effects/ParticleBackground").then((m) => m.ParticleBackground),
  { ssr: false }
);
const ChromaVideoBackground = dynamic(
  () => import("@/components/effects/ChromaVideoBackground").then((m) => m.ChromaVideoBackground),
  { ssr: false }
);

/*
 * Mobile-first: every unprefixed class below describes the phone layout, a
 * single centred column with the mascot on top, and `md:` layers the desktop
 * layout over it: copy in a left-hand 45% column, the chroma-keyed video and
 * particle canvas filling the right.
 */
export function HeroSection({ lang, hero }: { lang: Locale; hero: Dictionary["heroSection"] }) {
  const isAr = lang === "ar";
  const fontClass = isAr ? "font-ar" : "font-en";
  const scrollLabel = isAr ? "مرر" : "SCROLL";

  const isDesktop = useIsDesktop();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

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
    // were empty, and below md its height is content-driven.
    <section
      dir="ltr"
      ref={sectionRef}
      className="apex-hero relative flex items-center overflow-hidden [contain:layout_paint]"
      aria-labelledby="hero-title"
    >
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(135deg,var(--color-background) 0%,color-mix(in srgb,var(--color-primary) 8%,var(--color-background)) 100%)",
        }}
      />

      {/* Desktop glow orbs; below md the .apex-hero::after gradients replace them. */}
      <div
        className="absolute pointer-events-none z-20 hidden md:block"
        aria-hidden="true"
        style={{
          top: "5%",
          right: "2%",
          width: "min(560px,50vw)",
          height: "min(560px,50vw)",
          borderRadius: "50%",
          background: "radial-gradient(circle,color-mix(in srgb,var(--color-primary) 14%,transparent) 0%,transparent 70%)",
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
          background: "radial-gradient(circle,color-mix(in srgb,var(--color-gold) 10%,transparent) 0%,transparent 70%)",
        }}
      />

      {/* Desktop-only watermark. */}
      <div
        className="absolute z-20 pointer-events-none hidden md:block"
        style={{ top: "10%", left: "6%", width: "min(360px,40vw)", height: "min(140px,16vw)", opacity: 0.08 }}
        aria-hidden="true"
      >
        <Image src="/images/Apex_logo.png" alt="" width={360} height={133} sizes="360px" className="object-contain" loading="lazy" quality={50} />
      </div>

      {isDesktop ? (
        <>
          <ParticleBackground />
          {/* Right half: the robot. The still mascot shows until the video's
              first frame is drawn, and stays when motion is reduced or WebGL2
              is unavailable, so this half is never empty. */}
          <div className="pointer-events-none absolute right-0 top-0 z-40 h-full w-1/2" aria-hidden="true">
            <Image
              src="/images/robot_mascot.avif"
              alt=""
              width={373}
              height={373}
              sizes="373px"
              className={`absolute inset-0 m-auto h-auto w-[min(373px,70%)] object-contain transition-opacity duration-700 ${
                videoReady ? "opacity-0" : "opacity-100"
              }`}
            />
            <ChromaVideoBackground isVisible={isVisible} onReady={() => setVideoReady(true)} />
          </div>
        </>
      ) : null}

      <div className="relative z-50 mx-auto flex w-full max-w-7xl flex-col px-5 pb-14 pt-24 sm:px-8 md:px-10 md:pb-16">
        <div
          dir={isAr ? "rtl" : "ltr"}
          className="flex flex-col items-center text-center md:mr-auto md:w-full md:max-w-[45%] md:items-start md:text-start"
        >
          <div
            className="apex-fade-up apex-delay-1 mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 md:mb-6"
            style={{
              background: "color-mix(in srgb,var(--color-primary) 12%,transparent)",
              borderColor: "color-mix(in srgb,var(--color-primary) 35%,transparent)",
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
            <span className={`text-xs font-bold ${isAr ? "" : "tracking-widest"} ${fontClass}`} style={{ color: "var(--color-primary)" }}>
              {hero.badge}
            </span>
          </div>

          {/* The two spans are block-level so the headline always breaks into the same two lines. */}
          <h1
            id="hero-title"
            className={`apex-fade-up apex-delay-2 font-bold text-[clamp(36px,10vw,78px)] md:text-[clamp(34px,9vw,78px)] ${
              isAr ? "leading-[1.3]" : "leading-[1.1] md:leading-[1.04]"
            } ${fontClass}`}
            style={{ textWrap: "balance" }}
          >
            <span className="block" style={{ color: "var(--color-primary-text)" }}>
              {hero.headline}
            </span>
            <span className="apex-shimmer-text block">{hero.highlight}</span>
          </h1>

          <p
            className={`apex-fade-up apex-delay-3 mt-4 max-w-[420px] leading-relaxed text-[clamp(15px,4vw,17px)] md:mt-6 ${fontClass}`}
            style={{ color: "var(--color-secondary-text)", textWrap: "balance" }}
          >
            {hero.subheadline}
          </p>

          {/* Stacked full-width on phones; one row from sm, following the column's direction. */}
          <div className="apex-fade-up apex-delay-4 mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 md:mt-9 md:justify-start">
            <Link
              href={`/${lang}/portfolio`}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-bold transition-transform active:scale-[0.98] sm:min-h-[48px] sm:w-auto sm:text-sm md:hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
                color: "var(--color-on-primary)",
                boxShadow: "0 8px 28px color-mix(in srgb,var(--color-primary) 42%,transparent)",
              }}
            >
              {hero.cta}
              <span className={`${isAr ? "rotate-180" : ""} inline-block`} aria-hidden="true">
                →
              </span>
            </Link>

            <Link
              href={`/${lang}/contact`}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border-2 px-8 py-3.5 text-[15px] font-bold transition-all hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] active:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] sm:min-h-[48px] sm:w-auto sm:text-sm"
              style={{ color: "var(--color-primary)", borderColor: "var(--color-primary)" }}
            >
              {hero.ctaSecondary}
            </Link>
          </div>

          {/* The tagline is Latin in both locales, so the row is always LTR. */}
          <div dir="ltr" className="apex-fade-up apex-delay-5 mt-8 flex items-center gap-3 md:mt-12" aria-hidden="true">
            <span className="h-px w-7 md:w-10" style={{ background: "linear-gradient(to left,var(--color-primary),transparent)" }} />
            <span className="font-en text-xs font-semibold tracking-[0.2em]" style={{ color: "var(--color-primary)" }}>
              {hero.tagline}
            </span>
            <span className="h-px w-7 md:hidden" style={{ background: "linear-gradient(to right,var(--color-primary),transparent)" }} />
          </div>
        </div>

        {/* Mobile hero visual, the counterpart of the desktop video. Later in the
            source so the headline is read first; `order-first` lifts it visually.
            It is the LCP candidate on phones. */}
        <div className="relative order-first mb-6 self-center md:hidden" aria-hidden="true">
          <div
            className="absolute -inset-[14%] rounded-full"
            style={{ background: "radial-gradient(circle,color-mix(in srgb,var(--color-primary) 22%,transparent) 0%,transparent 68%)" }}
          />
          <div className="absolute inset-[6%] rounded-full border" style={{ borderColor: "color-mix(in srgb,var(--color-primary) 18%,transparent)" }} />
          <Image
            src="/images/robot_mascot.avif"
            alt=""
            width={373}
            height={373}
            preload
            fetchPriority="high"
            quality={60}
            sizes="240px"
            className="relative h-auto w-[min(58vw,240px,30svh)] object-contain apex-hero-float [mask-image:linear-gradient(to_bottom,black_72%,transparent)]"
          />
        </div>
      </div>

      {/* Scroll cue, desktop only: the hero is not a locked 100svh on phones. */}
      <div
        className="pointer-events-none absolute bottom-7 left-1/2 z-50 hidden -translate-x-1/2 flex-col items-center gap-2 opacity-40 md:flex"
        aria-hidden="true"
      >
        <span className={`text-[10px] font-semibold ${isAr ? "" : "tracking-[0.2em]"} ${fontClass}`} style={{ color: "var(--color-secondary-text)" }}>
          {scrollLabel}
        </span>
        <div style={{ width: "1px", height: "36px", background: "linear-gradient(to bottom,var(--color-primary),transparent)" }} />
      </div>
    </section>
  );
}
