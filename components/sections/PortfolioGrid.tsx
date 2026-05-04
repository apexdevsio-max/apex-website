"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type { PortfolioItem } from "@/lib/content/content-loader";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";
import { MOCK_PORTFOLIO } from "@/lib/mock/portfolio-data";

type ProjectVisual = {
  slug: string;
  category: string;
  emoji: string;
  gradient: string;
  accentColor: string;
  tags: string[];
};

const PROJECT_VISUALS: ProjectVisual[] = [
  {
    slug: "ecommerce-fashion",
    category: "ecommerce",
    emoji: "🛒",
    gradient: "linear-gradient(135deg,#1a1a2e,#16213e)",
    accentColor: "#00BCD4",
    tags: ["Next.js", "Stripe", "Tailwind"],
  },
  {
    slug: "edu-app-ios",
    category: "mobile",
    emoji: "📚",
    gradient: "linear-gradient(135deg,#0f0c29,#302b63)",
    accentColor: "#FFBF00",
    tags: ["React Native", "Expo", "Firebase"],
  },
  {
    slug: "ai-video-series",
    category: "ai",
    emoji: "🎬",
    gradient: "linear-gradient(135deg,#1a1a2e,#0d0d1a)",
    accentColor: "#4DD0E1",
    tags: ["Sora", "After Effects", "Midjourney"],
  },
  {
    slug: "saas-dashboard",
    category: "web",
    emoji: "💻",
    gradient: "linear-gradient(135deg,#0f2027,#203a43)",
    accentColor: "#00BCD4",
    tags: ["Next.js", "TypeScript", "Prisma"],
  },
];

const CATEGORY_LABELS = {
  ar: {
    all: "الكل",
    web: "تطوير ويب",
    mobile: "تطبيقات موبايل",
    ecommerce: "تجارة إلكترونية",
    ai: "ذكاء اصطناعي",
  },
  en: {
    all: "All",
    web: "Web",
    mobile: "Mobile Apps",
    ecommerce: "E-Commerce",
    ai: "AI",
  },
} as const;

function normalizeCategory(category: string): "web" | "mobile" | "ecommerce" | "ai" {
  const normalized = category.toLowerCase();

  if (normalized.includes("commerce")) return "ecommerce";
  if (normalized.includes("mobile") || normalized.includes("app") || normalized.includes("game")) {
    return "mobile";
  }
  if (normalized.includes("ai")) return "ai";
  return "web";
}

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(22px)",
        transition: `opacity 0.6s ${delay}ms ease, transform 0.6s ${delay}ms ease`,
      }}
    >
      {children}
    </div>
  );
}

function ProjectCard({
  slug,
  title,
  summary,
  categoryLabel,
  emoji,
  gradient,
  accentColor,
  tags,
  lang,
  ctaLabel,
}: {
  slug: string;
  title: string;
  summary: string;
  categoryLabel: string;
  emoji: string;
  gradient: string;
  accentColor: string;
  tags: string[];
  lang: Locale;
  ctaLabel: string;
}) {
  const isAr = lang === "ar";
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/${lang}/portfolio/${slug}`}
      className="apex-card-base group flex flex-col overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        borderColor: hovered ? accentColor : "var(--color-border)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 20px 50px color-mix(in srgb,${accentColor} 20%,transparent)`
          : "none",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden" style={{ height: "200px", background: gradient }}>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute rounded-full transition-all duration-500"
          style={{
            width: hovered ? "220px" : "160px",
            height: hovered ? "220px" : "160px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            background: `radial-gradient(circle,${accentColor}30 0%,transparent 70%)`,
          }}
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            fontSize: "64px",
            filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3))",
            transition: "transform 0.3s ease",
            transform: hovered ? "scale(1.12)" : "scale(1)",
          }}
        >
          {emoji}
        </div>

        <div
          className="absolute top-3 rounded-full px-3 py-1 text-xs font-bold"
          style={{
            [isAr ? "left" : "right"]: "12px",
            background: `color-mix(in srgb,${accentColor} 20%,rgba(0,0,0,0.5))`,
            border: `1px solid ${accentColor}50`,
            color: accentColor,
            backdropFilter: "blur(8px)",
          }}
        >
          {categoryLabel}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6" dir={isAr ? "rtl" : "ltr"}>
        <div className={`mb-3 flex flex-wrap gap-1.5 ${isAr ? "flex-row-reverse" : ""}`}>
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{
                background: "color-mix(in srgb,var(--color-primary) 10%,transparent)",
                color: "var(--color-primary)",
                border: "1px solid color-mix(in srgb,var(--color-primary) 22%,transparent)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h3
          className={`mb-2 font-bold leading-snug ${isAr ? "font-ar" : "font-en"}`}
          style={{ fontSize: "16px", color: "var(--color-primary-text)" }}
        >
          {title}
        </h3>

        <p
          className={`flex-1 text-sm leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          {summary}
        </p>

        <div
          className={`mt-5 flex items-center gap-2 text-sm font-bold ${
            isAr ? "flex-row-reverse justify-end" : ""
          }`}
          style={{ color: accentColor }}
        >
          {ctaLabel}
        </div>
      </div>
    </Link>
  );
}

export function PortfolioGrid({
  lang,
  dictionary,
  mdxItems,
}: {
  lang: Locale;
  dictionary: Dictionary;
  mdxItems: PortfolioItem[];
}) {
  const isAr = lang === "ar";
  const [activeFilter, setActiveFilter] = useState("all");

  const categoryLabels = CATEGORY_LABELS[lang];
  const categories = [
    { key: "all", label: categoryLabels.all },
    { key: "web", label: categoryLabels.web },
    { key: "mobile", label: categoryLabels.mobile },
    { key: "ecommerce", label: categoryLabels.ecommerce },
    { key: "ai", label: categoryLabels.ai },
  ];

  const projects = useMemo(() => {
    if (mdxItems.length > 0) {
      return mdxItems.map((item, index) => {
        const visual = PROJECT_VISUALS[index % PROJECT_VISUALS.length];
        const category = normalizeCategory(item.slug + " " + item.title + " " + item.description);

        return {
          slug: item.slug,
          category,
          emoji: visual.emoji,
          gradient: visual.gradient,
          accentColor: visual.accentColor,
          tags: visual.tags,
          title: item.title,
          summary: item.summary,
        };
      });
    }

    return Object.entries(MOCK_PORTFOLIO).map(([slug, item], index) => {
      const visual = PROJECT_VISUALS[index % PROJECT_VISUALS.length];
      return {
        slug,
        category: normalizeCategory(item.category),
        emoji: item.emoji || visual.emoji,
        gradient: item.gradient || visual.gradient,
        accentColor: item.accentColor || visual.accentColor,
        tags: item.tags.length > 0 ? item.tags : visual.tags,
        title: item[lang].title,
        summary: item[lang].summary,
      };
    });
  }, [lang, mdxItems]);

  const filtered =
    activeFilter === "all"
      ? projects
      : projects.filter((project) => project.category === activeFilter);

  return (
    <main
      className="min-h-screen px-6 pb-24 pt-28"
      style={{ background: "var(--color-background)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="mb-14 text-center">
            <span className="apex-section-label">{dictionary.portfolio.badge}</span>
            <div className="apex-divider" />
            <h1
              className={`mt-5 font-bold leading-tight ${isAr ? "font-ar" : "font-en"}`}
              style={{ fontSize: "clamp(28px,4vw,52px)", color: "var(--color-primary-text)" }}
            >
              {dictionary.portfolio.title}
            </h1>
            <p
              className={`mx-auto mt-4 leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
              style={{
                maxWidth: "500px",
                fontSize: "clamp(14px,1.5vw,16px)",
                color: "var(--color-secondary-text)",
              }}
            >
              {dictionary.portfolio.subtitle}
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="mb-12 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveFilter(category.key)}
                className={`rounded-full border px-5 py-2 text-sm font-bold transition-all duration-200 ${
                  isAr ? "font-ar" : "font-en"
                }`}
                style={
                  activeFilter === category.key
                    ? {
                        background: "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
                        borderColor: "transparent",
                        color: "#fff",
                        boxShadow:
                          "0 4px 18px color-mix(in srgb,var(--color-primary) 38%,transparent)",
                        transform: "translateY(-1px)",
                      }
                    : {
                        background: "var(--color-card)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-secondary-text)",
                      }
                }
              >
                {category.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, index) => (
            <Reveal key={project.slug} delay={index * 60}>
              <ProjectCard
                slug={project.slug}
                title={project.title}
                summary={project.summary}
                categoryLabel={categoryLabels[project.category]}
                emoji={project.emoji}
                gradient={project.gradient}
                accentColor={project.accentColor}
                tags={project.tags}
                lang={lang}
                ctaLabel={dictionary.portfolio.viewProject}
              />
            </Reveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-20 text-center" style={{ color: "var(--color-secondary-text)" }}>
            <div className="mb-4 text-5xl">🔍</div>
            <p className={isAr ? "font-ar" : "font-en"}>
              {isAr ? "لا توجد مشاريع ضمن هذا التصنيف حاليًا." : "No projects in this category yet."}
            </p>
          </div>
        )}

        <Reveal delay={100}>
          <div
            className="mt-20 grid grid-cols-2 gap-6 rounded-2xl border p-8 md:grid-cols-4"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
          >
            {[
              { value: "24+", label: isAr ? "مشروع منجز" : "Projects Delivered" },
              { value: "5", label: isAr ? "مجالات" : "Specializations" },
              { value: "100%", label: isAr ? "رضا العملاء" : "Client Satisfaction" },
              { value: "2x", label: isAr ? "سرعة التسليم" : "Faster Delivery" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="font-bold"
                  style={{
                    fontSize: "clamp(24px,3vw,38px)",
                    color: "var(--color-primary)",
                    fontFamily: "var(--font-en)",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className={`mt-1 text-sm ${isAr ? "font-ar" : "font-en"}`}
                  style={{ color: "var(--color-secondary-text)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-14 text-center">
            <p
              className={`mb-6 text-lg font-medium ${isAr ? "font-ar" : "font-en"}`}
              style={{ color: "var(--color-secondary-text)" }}
            >
              {isAr ? "مشروعك القادم يستحق فريقًا يفهم المنتج والتنفيذ" : "Your next project deserves a team that understands both product and delivery"}
            </p>
            <Link
              href={`/${lang}/contact`}
              className="apex-btn apex-btn-primary inline-flex items-center gap-3 rounded-full px-10 py-3.5 text-sm font-bold text-white"
            >
              {isAr ? "ابدأ مشروعك معنا" : "Start Your Project"}
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
