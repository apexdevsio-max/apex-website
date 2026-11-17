"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";

import { useIsDesktop } from "@/lib/hooks/useIsDesktop";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";

// Desktop-only WebGL layer, kept out of the initial bundle and the server HTML.
const ChromaVideoBackground = dynamic(
  () => import("@/components/effects/ChromaVideoBackground").then((m) => m.ChromaVideoBackground),
  { ssr: false }
);

/**
 * Mobile-first hero. Copy sits on the inline-start side and the robot on the
 * inline-end side, so Arabic mirrors naturally (copy right, robot left).
 *
 * Depth comes from a CSS perspective floor the robot stands on, a contact
 * shadow, and a small pointer tilt on desktop. No canvas runs on the main
 * thread; the old particle mesh moved under 0.1px a second and was invisible
 * in light mode.
 */
export function HeroSection({ lang, hero }: { lang: Locale; hero: Dictionary["heroSection"] }) {
  const isAr = lang === "ar";
  const isDesktop = useIsDesktop();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { rootMargin: "200px" });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Pointer tilt, written straight to CSS variables so React does not re-render
  // per mouse move. Ignored for touch and under reduced motion (see CSS).
  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || !stageRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    stageRef.current.style.setProperty("--tilt-x", `${(-y * 6).toFixed(2)}deg`);
    stageRef.current.style.setProperty("--tilt-y", `${(x * 8).toFixed(2)}deg`);
  };
  const onPointerLeave = () => {
    stageRef.current?.style.setProperty("--tilt-x", "0deg");
    stageRef.current?.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      className="apex-hero relative isolate overflow-hidden"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div aria-hidden="true" className="apex-hero-backdrop" />
      <div aria-hidden="true" className="apex-hero-floor" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-6 px-5 pb-12 pt-8 sm:px-8 md:min-h-[calc(100svh-70px)] md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-10 md:px-10 md:py-16">
        <div className="flex flex-col items-start">
          <p className="apex-eyebrow apex-fade-up apex-delay-1">{hero.badge}</p>

          <h1 id="hero-title" className="apex-hero-title apex-fade-up">
            <span className="block text-apex-text">{hero.headline}</span>
            <span className="apex-gradient-text block">{hero.highlight}</span>
          </h1>

          <p className="apex-fade-up apex-delay-3 mt-5 max-w-[34rem] text-lg leading-relaxed text-apex-muted">
            {hero.subheadline}
          </p>

          <div className="apex-fade-up apex-delay-4 mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href={`/${lang}/contact`} className="apex-btn-primary min-h-[52px] px-8 text-base">
              {hero.cta}
            </Link>
            <Link href={`/${lang}/portfolio`} className="apex-btn-outline min-h-[52px] px-8 text-base">
              {hero.ctaSecondary}
            </Link>
          </div>

          <ul className="apex-fade-up apex-delay-5 mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-apex-muted">
            {hero.proof.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-apex-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* The robot stage. On phones it is a compact poster under the copy, so
            the call to action stays in the first screen. */}
        <div ref={stageRef} aria-hidden="true" className="apex-hero-stage relative mx-auto aspect-square w-[min(62vw,260px)] md:w-full md:max-w-[560px]">
          <div className="apex-hero-shadow" />
          <div className="apex-hero-robot absolute inset-0">
            <Image
              src="/images/robot_mascot.avif"
              alt=""
              width={373}
              height={373}
              preload
              fetchPriority="high"
              sizes="(min-width: 768px) 373px, 260px"
              className={`absolute inset-0 m-auto h-auto w-full max-w-[373px] object-contain transition-opacity duration-700 ${
                videoReady ? "md:opacity-0" : "opacity-100"
              }`}
            />
            {isDesktop && <ChromaVideoBackground isVisible={isVisible} onReady={() => setVideoReady(true)} />}
          </div>
        </div>
      </div>
      <span className="sr-only">{isAr ? "نهاية القسم الافتتاحي" : "End of introduction"}</span>
    </section>
  );
}
