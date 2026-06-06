"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";

import { Reveal } from "@/components/ui/Reveal";
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
  thumbnail?: string;
  driveUrl?: string;
};

const PROJECT_VISUALS: ProjectVisual[] = [
  {
    slug: "dental-clinic-motion",
    category: "content",
    emoji: "🦷",
    gradient: "linear-gradient(135deg,#0d1b2a,#1b263b)",
    accentColor: "#4DD0E1",
    tags: ["After Effects", "Motion Graphics", "Premiere Pro"],
    thumbnail: "/images/portfolio/dental-clinic-motion-1.jpg",
    driveUrl: "https://drive.google.com/drive/folders/139gHCMfTflVlcHP4E9K3MKdI_VoGaEKK",
  },
  {
    slug: "ai-video-series",
    category: "content",
    emoji: "🎬",
    gradient: "linear-gradient(135deg,#1a1a2e,#0d0d1a)",
    accentColor: "#4DD0E1",
    tags: ["Sora", "After Effects", "Midjourney"],
    thumbnail: "/images/portfolio/ai-video-series.svg",
    driveUrl: "https://drive.google.com/drive/folders/1x",
  },
  {
    slug: "jewelry-showcase",
    category: "content",
    emoji: "💎",
    gradient: "linear-gradient(135deg,#0a0a0f,#1a1a2e)",
    accentColor: "#FFD700",
    tags: ["Premiere Pro", "Cinematic", "Color Grading"],
    thumbnail: "/images/portfolio/jewelry-showcase-1.jpg",
    driveUrl: "https://drive.google.com/drive/folders/1wxuTZADlq2R5U_xrP9NeN59uIyHQxkgE",
  },
  {
    slug: "esthetic-clinic-reels",
    category: "content",
    emoji: "💄",
    gradient: "linear-gradient(135deg,#1a0a1e,#2d1b36)",
    accentColor: "#FF6B9D",
    tags: ["Premiere Pro", "Social Media", "Motion Graphics"],
    thumbnail: "/images/portfolio/esthetic-clinic-reels-1.jpg",
    driveUrl: "https://drive.google.com/drive/folders/1TtoaFizvOsgnJ9UKZYwtFFwpfXHklJTR",
  },
  {
    slug: "ai-design-brand",
    category: "content",
    emoji: "🎨",
    gradient: "linear-gradient(135deg,#0d0d1a,#1a0533)",
    accentColor: "#00BCD4",
    tags: ["Midjourney", "Figma", "Canva AI"],
    thumbnail: "/images/portfolio/ai-design-brand.svg",
    driveUrl: "https://drive.google.com/drive/folders/1x",
  },
  {
    slug: "wifaq-qatar-ai",
    category: "content",
    emoji: "🤝",
    gradient: "linear-gradient(135deg,#0a1628,#1a2a4a)",
    accentColor: "#4DD0E1",
    tags: ["AI Video", "Motion Graphics", "Humanitarian"],
    thumbnail: "/images/portfolio/wifaq-qatar-ai-1.jpg",
    driveUrl: "https://drive.google.com/drive/folders/1kTAL_eSGDdBfdBtwIF7Q3xQM6yxFNxi3-F",
  },
  {
    slug: "fatiha-family-ai",
    category: "content",
    emoji: "📖",
    gradient: "linear-gradient(135deg,#1a0f00,#3d2b1a)",
    accentColor: "#FFB74D",
    tags: ["AI Video", "Motion Graphics", "Educational", "Family"],
    thumbnail: "/images/portfolio/fatiha-family-ai-1.jpg",
    driveUrl: "https://drive.google.com/drive/folders/1GvP9I9mL6P3Ke90Rv2EHnnnNjvot3B1M",
  },
  {
    slug: "arnoub-adventure-ai",
    category: "content",
    emoji: "🐰",
    gradient: "linear-gradient(135deg,#1a0033,#3d1a5e)",
    accentColor: "#CE93D8",
    tags: ["2D Animation", "AI Video", "Children's Content", "Storytelling"],
    thumbnail: "/images/portfolio/arnoub-adventure-ai-1.jpg",
    driveUrl: "https://drive.google.com/drive/folders/1QPzncgp0YwVZAWpTASKXTWrV3Yf04pzw",
  },
  {
    slug: "tajweed-kids-ai",
    category: "content",
    emoji: "📿",
    gradient: "linear-gradient(135deg,#0a1f0a,#1a3d1a)",
    accentColor: "#66BB6A",
    tags: ["AI Video", "Educational", "Children's Content", "Motion Graphics"],
    thumbnail: "/images/portfolio/tajweed-kids-ai-1.jpg",
    driveUrl: "https://drive.google.com/file/d/1Dilf9f9a81YmbA91bPR_iVrULK7QOXk6/view?usp=sharing",
  },
  {
    slug: "tafawwoq-educational-app",
    category: "mobile",
    emoji: "⭐",
    gradient: "linear-gradient(135deg,#0a1628,#1a2a4a)",
    accentColor: "#4FC3F7",
    tags: ["Flutter", "Clean Architecture", "BLoC", "Educational", "Cross-Platform"],
    thumbnail: "/images/portfolio/tafawwoq-educational-app-1.jpg",
  },
];

const CATEGORY_LABELS = {
  ar: {
    all: "الكل",
    web: "تطوير ويب",
    mobile: "تطبيقات موبايل",
    ecommerce: "تجارة إلكترونية",
    ai: "ذكاء اصطناعي",
    content: "صناعة المحتوى",
  },
  en: {
    all: "All",
    web: "Web",
    mobile: "Mobile Apps",
    ecommerce: "E-Commerce",
    ai: "AI",
    content: "Content Creation",
  },
} as const;

function normalizeCategory(category: string): "web" | "mobile" | "ecommerce" | "ai" | "content" {
  const normalized = category.toLowerCase();

  if (normalized.includes("commerce")) return "ecommerce";
  if (/\b(mobile|app|apps|game|games)\b/.test(normalized)) return "mobile";
  if (/\b(content|creation)\b/.test(normalized)) return "content";
  if (/\b(ai)\b/.test(normalized)) return "ai";
  return "web";
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
  thumbnail,
  driveUrl,
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
  thumbnail?: string;
  driveUrl?: string;
}) {
  const isAr = lang === "ar";
  const [imgError, setImgError] = useState(false);

  return (
    <>
      <style>{`
        .portfolio-card {
          --card-accent: ${accentColor};
        }
        @media (hover: hover) {
          .portfolio-card:hover {
            border-color: var(--card-accent);
            transform: translateY(-6px);
            box-shadow: 0 20px 50px color-mix(in srgb, var(--card-accent) 20%, transparent);
          }
          .portfolio-card:hover .card-img {
            transform: scale(1.08);
          }
          .portfolio-card:hover .card-emoji-pf {
            transform: scale(1.12);
          }
          .portfolio-card:hover .card-glow-pf {
            width: 220px;
            height: 220px;
          }
        }
        @media (hover: none) {
          .portfolio-card:active {
            border-color: var(--card-accent);
            transform: translateY(-3px);
          }
          .portfolio-card:active .card-emoji-pf {
            transform: scale(1.06);
          }
        }
      `}</style>
      <div className="portfolio-card apex-card-base group flex flex-col overflow-hidden rounded-2xl transition-all duration-300"
        style={{
          borderColor: "var(--color-border)",
          transform: "translateY(0)",
          boxShadow: "none",
        }}
      >
        <Link href={`/${lang}/portfolio/${slug}`} className="block" style={{ textDecoration: "none" }}>
          <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", background: gradient }}>
            {thumbnail && !imgError ? (
              <Image
                src={thumbnail}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="card-img object-cover transition-transform duration-500"
                onError={() => setImgError(true)}
              />
            ) : (
              <>
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
                  className="card-glow-pf pointer-events-none absolute rounded-full transition-all duration-500"
                  style={{
                    width: "160px",
                    height: "160px",
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
                    transform: "scale(1)",
                  }}
                >
                  <span className="card-emoji-pf" style={{ transition: "transform 0.3s ease" }}>
                    {emoji}
                  </span>
                </div>
              </>
            )}

            <div
              className="absolute top-3 rounded-full px-3 py-1.5 text-xs font-bold"
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
        </Link>

        <div className="flex flex-1 flex-col p-4 md:p-6" dir={isAr ? "rtl" : "ltr"}>
          <div className={`mb-3 flex flex-wrap gap-1.5 ${isAr ? "flex-row-reverse" : ""}`}>
            {tags.map((tag) => (
              <span
                key={tag}
                 className="rounded-full px-2 py-0.5 text-xs font-semibold"
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
            style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "var(--color-primary-text)" }}
          >
            {title}
          </h3>

          <p
            className={`flex-1 text-sm leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
            style={{ color: "var(--color-secondary-text)" }}
          >
            {summary}
          </p>

          <div className={`mt-auto flex flex-wrap items-center gap-3 pt-4 ${isAr ? "flex-row-reverse" : ""}`}>
            <Link
              href={`/${lang}/portfolio/${slug}`}
              className="flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-80 py-2"
              style={{ color: accentColor }}
            >
              {ctaLabel}
            </Link>

            {driveUrl && (
              <a
                href={driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all hover:opacity-85"
                style={{
                  background: `color-mix(in srgb,${accentColor} 14%,transparent)`,
                  color: accentColor,
                  border: `1px solid color-mix(in srgb,${accentColor} 30%,transparent)`,
                }}
              >
                <ExternalLink size={14} />
                {isAr ? "مشاهدة" : "Watch"}
              </a>
            )}
          </div>
        </div>
      </div>
    </>
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
    { key: "content", label: categoryLabels.content },
    { key: "ai", label: categoryLabels.ai },
  ];

  const projects = useMemo(() => {
    if (mdxItems.length > 0) {
      return mdxItems.map((item) => {
        const visual = PROJECT_VISUALS.find((v) => v.slug === item.slug) ?? PROJECT_VISUALS[Math.abs(item.slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % PROJECT_VISUALS.length];
        const category = normalizeCategory(item.slug + " " + item.title + " " + item.description);

        return {
          slug: item.slug,
          category,
          emoji: visual.emoji,
          gradient: visual.gradient,
          accentColor: visual.accentColor,
          tags: visual.tags,
          thumbnail: item.thumbnail ?? (item.images?.[0]) ?? visual.thumbnail,
          driveUrl: item.driveUrl ?? visual.driveUrl,
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
        thumbnail: visual.thumbnail,
        driveUrl: visual.driveUrl,
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
      className="min-h-screen px-6 pb-16 md:pb-24 pt-16 md:pt-28"
      style={{ background: "var(--color-background)" }}
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
          <div className="mb-12 flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible justify-start md:justify-center gap-2 py-1">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveFilter(category.key)}
                className={`rounded-full border px-5 min-h-[44px] py-3.5 text-sm font-bold transition-all duration-200 ${
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
                thumbnail={project.thumbnail}
                driveUrl={project.driveUrl}
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
            className="mt-20 grid grid-cols-2 gap-6 rounded-2xl border p-5 md:p-8 md:grid-cols-4"
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
