
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale }     from "@/lib/i18n/locale";
import type { PortfolioItem } from "@/lib/content/content-loader";


const MOCK_PROJECTS = [
  {
    slug:        "ecommerce-fashion",
    category:    "ecommerce",
    emoji:       "🛒",
    gradient:    "linear-gradient(135deg,#1a1a2e,#16213e)",
    accentColor: "#00BCD4",
    tags:        ["Next.js", "Stripe", "Tailwind"],
  },
  {
    slug:        "edu-app-ios",
    category:    "mobile",
    emoji:       "📚",
    gradient:    "linear-gradient(135deg,#0f0c29,#302b63)",
    accentColor: "#FFBF00",
    tags:        ["React Native", "Expo", "Firebase"],
  },
  {
    slug:        "ai-video-series",
    category:    "ai",
    emoji:       "🎬",
    gradient:    "linear-gradient(135deg,#1a1a2e,#0d0d1a)",
    accentColor: "#4DD0E1",
    tags:        ["Sora", "After Effects", "Midjourney"],
  },
  {
    slug:        "mobile-game-adventure",
    category:    "mobile",
    emoji:       "🎮",
    gradient:    "linear-gradient(135deg,#0d1b2a,#1b263b)",
    accentColor: "#FFBF00",
    tags:        ["Unity", "C#", "AdMob"],
  },
  {
    slug:        "saas-dashboard",
    category:    "web",
    emoji:       "💻",
    gradient:    "linear-gradient(135deg,#0f2027,#203a43)",
    accentColor: "#00BCD4",
    tags:        ["Next.js", "TypeScript", "Prisma"],
  },
  {
    slug:        "business-app",
    category:    "mobile",
    emoji:       "📊",
    gradient:    "linear-gradient(135deg,#141e30,#243b55)",
    accentColor: "#5C6BC0",
    tags:        ["Flutter", "Dart", "REST API"],
  },
  {
    slug:        "real-estate-platform",
    category:    "web",
    emoji:       "🏠",
    gradient:    "linear-gradient(135deg,#1a1a2e,#16213e)",
    accentColor: "#4DD0E1",
    tags:        ["Next.js", "Maps API", "PostgreSQL"],
  },
  {
    slug:        "food-delivery-app",
    category:    "mobile",
    emoji:       "🍔",
    gradient:    "linear-gradient(135deg,#200122,#6f0000)",
    accentColor: "#FFBF00",
    tags:        ["React Native", "Node.js", "MongoDB"],
  },
  {
    slug:        "ai-design-brand",
    category:    "ai",
    emoji:       "🎨",
    gradient:    "linear-gradient(135deg,#0d0d1a,#1a0533)",
    accentColor: "#00BCD4",
    tags:        ["Midjourney", "Figma", "Canva AI"],
  },
  {
    slug:        "electronics-store",
    category:    "ecommerce",
    emoji:       "📱",
    gradient:    "linear-gradient(135deg,#0f2027,#2c5364)",
    accentColor: "#5C6BC0",
    tags:        ["WooCommerce", "WordPress", "PHP"],
  },
  {
    slug:        "fitness-tracker",
    category:    "mobile",
    emoji:       "💪",
    gradient:    "linear-gradient(135deg,#1a1a2e,#0f3460)",
    accentColor: "#FFBF00",
    tags:        ["Swift", "HealthKit", "SwiftUI"],
  },
  {
    slug:        "uiux-banking",
    category:    "web",
    emoji:       "🏦",
    gradient:    "linear-gradient(135deg,#0a0a0a,#1a1a2e)",
    accentColor: "#4DD0E1",
    tags:        ["Figma", "Protopie", "User Research"],
  },
];


const MOCK_META: Record<string, { ar: { title: string; summary: string }; en: { title: string; summary: string } }> = {
  "ecommerce-fashion":   { ar:{ title:"منصة متجر أزياء متكاملة",    summary:"متجر إلكتروني احترافي مع إدارة مخزون وبوابة دفع آمنة وتجربة تسوق سلسة." }, en:{ title:"Full Fashion E-Commerce Platform",    summary:"Professional online store with inventory management, secure payment gateway, and seamless shopping experience." } },
  "edu-app-ios":         { ar:{ title:"تطبيق تعليمي تفاعلي iOS",     summary:"تطبيق موبايل للتعليم بمحتوى تفاعلي ومتابعة تقدم الطالب وشهادات رقمية." }, en:{ title:"Interactive iOS Educational App",     summary:"Mobile learning app with interactive content, student progress tracking, and digital certificates." } },
  "ai-video-series":     { ar:{ title:"سلسلة فيديوهات مصممة بالـ AI", summary:"إنتاج محتوى فيديو احترافي بأدوات الذكاء الاصطناعي لحملة تسويقية متكاملة." }, en:{ title:"AI-Designed Video Series",            summary:"Professional video content production using AI tools for an integrated marketing campaign." } },
  "mobile-game-adventure":{ ar:{ title:"لعبة مغامرات موبايل",        summary:"لعبة أكشن ثلاثية الأبعاد بـ Unity مع نظام تقدم وجوائز وأكثر من 50 مستوى." }, en:{ title:"Mobile Adventure Game",              summary:"3D action game built with Unity featuring progression system, rewards, and 50+ levels." } },
  "saas-dashboard":      { ar:{ title:"لوحة تحكم SaaS متقدمة",       summary:"منصة ويب لإدارة الأعمال مع تحليلات لحظية وتقارير تفصيلية وصلاحيات متعددة." }, en:{ title:"Advanced SaaS Dashboard",            summary:"Business management web platform with real-time analytics, detailed reports, and multi-role permissions." } },
  "business-app":        { ar:{ title:"تطبيق إدارة أعمال Flutter",    summary:"تطبيق هجين iOS/Android لإدارة الفريق والمهام والمشاريع مع تكامل API." }, en:{ title:"Flutter Business Management App",    summary:"Cross-platform iOS/Android app for team, task, and project management with API integration." } },
  "real-estate-platform":{ ar:{ title:"منصة عقارات رقمية متكاملة",    summary:"موقع عقارات مع خرائط تفاعلية وبحث متقدم وإدارة قوائم العقارات." }, en:{ title:"Integrated Real Estate Platform",    summary:"Real estate website with interactive maps, advanced search, and property listing management." } },
  "food-delivery-app":   { ar:{ title:"تطبيق توصيل طعام سريع",        summary:"تطبيق توصيل مع تتبع لحظي للطلب وإدارة مطاعم متعددة ونظام تقييمات." }, en:{ title:"Fast Food Delivery App",             summary:"Delivery app with real-time order tracking, multi-restaurant management, and rating system." } },
  "ai-design-brand":     { ar:{ title:"هوية بصرية مصممة بالـ AI",      summary:"هوية تجارية متكاملة مصممة بأدوات الذكاء الاصطناعي مع دليل استخدام الهوية." }, en:{ title:"AI-Designed Brand Identity",         summary:"Complete brand identity designed with AI tools, including a comprehensive brand usage guide." } },
  "electronics-store":   { ar:{ title:"متجر إلكترونيات ومستلزمات",     summary:"متجر إلكتروني لبيع الإلكترونيات مع مقارنة المنتجات وتقييمات العملاء." }, en:{ title:"Electronics & Accessories Store",    summary:"E-commerce store for electronics with product comparison and customer review features." } },
  "fitness-tracker":     { ar:{ title:"تطبيق تتبع اللياقة البدنية",    summary:"تطبيق iOS بتكامل HealthKit لتتبع التمارين والحمية الغذائية والنوم." }, en:{ title:"Fitness & Health Tracker App",       summary:"iOS app with HealthKit integration for tracking workouts, diet, and sleep patterns." } },
  "uiux-banking":        { ar:{ title:"تصميم UI/UX تطبيق بنكي",        summary:"دراسة حالة تصميمية شاملة لتطبيق بنكي مع أبحاث مستخدم واختبار قابلية الاستخدام." }, en:{ title:"Banking App UI/UX Design",           summary:"Comprehensive design case study for a banking app with user research and usability testing." } },
};

const CATEGORIES_AR = [
  { key: "all",       label: "الكل" },
  { key: "web",       label: "تطوير ويب" },
  { key: "mobile",    label: "تطبيقات موبايل" },
  { key: "ecommerce", label: "متاجر إلكترونية" },
  { key: "ai",        label: "ذكاء اصطناعي" },
];
const CATEGORIES_EN = [
  { key: "all",       label: "All" },
  { key: "web",       label: "Web Dev" },
  { key: "mobile",    label: "Mobile Apps" },
  { key: "ecommerce", label: "E-Commerce" },
  { key: "ai",        label: "AI Content" },
];


function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.6s ${delay}ms ease, transform 0.6s ${delay}ms ease` }}>
      {children}
    </div>
  );
}

/* ─── Project card ──────────────────────────────────────── */
function ProjectCard({
  slug, title, summary, category, emoji, gradient, accentColor, tags, lang, ctaLabel,
}: {
  slug: string; title: string; summary: string; category: string;
  emoji: string; gradient: string; accentColor: string; tags: string[];
  lang: Locale; ctaLabel: string;
}) {
  const isAr = lang === "ar";
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/${lang}/portfolio/category/${slug}`}
      className="apex-card-base group flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        borderColor:  hovered ? accentColor : "var(--color-border)",
        transform:    hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow:    hovered ? `0 20px 50px color-mix(in srgb,${accentColor} 20%,transparent)` : "none",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      
      <div className="relative overflow-hidden" style={{ height: "200px", background: gradient }}>
        
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)`,
          backgroundSize: "24px 24px",
        }} aria-hidden="true" />

        
        <div className="absolute rounded-full transition-all duration-500 pointer-events-none"
          style={{
            width: hovered ? "220px" : "160px",
            height: hovered ? "220px" : "160px",
            top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            background: `radial-gradient(circle,${accentColor}30 0%,transparent 70%)`,
          }} aria-hidden="true" />

        
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ fontSize: "64px", filter: "drop-shadow(0 0 20px rgba(255,255,255,0.3))", transition: "transform 0.3s ease", transform: hovered ? "scale(1.12)" : "scale(1)" }}>
          {emoji}
        </div>

        
        <div className="absolute top-3 px-3 py-1 rounded-full text-xs font-bold"
          style={{
            [isAr ? "left" : "right"]: "12px",
            background: `color-mix(in srgb,${accentColor} 20%,rgba(0,0,0,0.5))`,
            border: `1px solid ${accentColor}50`,
            color: accentColor,
            backdropFilter: "blur(8px)",
          }}>
          {category}
        </div>
      </div>

      
      <div className="flex flex-col flex-1 p-6" dir={isAr ? "rtl" : "ltr"}>
        
        <div className={`flex flex-wrap gap-1.5 mb-3 ${isAr ? "flex-row-reverse" : ""}`}>
          {tags.map(t => (
            <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: "color-mix(in srgb,var(--color-primary) 10%,transparent)",
                color: "var(--color-primary)",
                border: "1px solid color-mix(in srgb,var(--color-primary) 22%,transparent)",
              }}>
              {t}
            </span>
          ))}
        </div>

        <h3 className={`font-bold mb-2 leading-snug ${isAr ? "font-ar" : "font-en"}`}
          style={{ fontSize: "16px", color: "var(--color-primary-text)" }}>
          {title}
        </h3>

        <p className={`leading-relaxed flex-1 text-sm ${isAr ? "font-ar" : "font-en"}`}
          style={{ color: "var(--color-secondary-text)" }}>
          {summary}
        </p>

        
        <div className={`mt-5 flex items-center gap-2 font-bold text-sm transition-all apex-arrow ${hovered ? "apex-arrow-shift" : ""} ${isAr ? "flex-row-reverse justify-end" : ""}`}
          style={{ color: accentColor }}>
          {ctaLabel}
        </div>
      </div>
    </Link>
  );
}

/* ─── Main component ────────────────────────────────────── */
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
  const categories = isAr ? CATEGORIES_AR : CATEGORIES_EN;
  const [activeFilter, setActiveFilter] = useState("all");

  /* Build project list — prefer MDX, fallback to mock */
  const projects = mdxItems.length > 0
    ? mdxItems.map((item, i) => {
        const mock = MOCK_PROJECTS[i % MOCK_PROJECTS.length];
        return { ...mock, slug: item.slug, title: item.title, summary: item.summary };
      })
    : MOCK_PROJECTS.map(p => ({
        ...p,
        title:   MOCK_META[p.slug]?.[lang]?.title   ?? p.slug,
        summary: MOCK_META[p.slug]?.[lang]?.summary ?? "",
      }));

  const filtered = activeFilter === "all"
    ? projects
    : projects.filter(p => p.category === activeFilter);

  const ctaLabel = isAr ? "عرض المشروع" : "View Project";

  return (
    <main
      className="min-h-screen pt-28 pb-24 px-6"
      style={{ background: "var(--color-background)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto">

        
        <Reveal>
          <div className="text-center mb-14">
            <span className="apex-section-label">{dictionary.portfolio.badge}</span>
            <div className="apex-divider" />
            <h1 className={`mt-5 font-bold leading-tight ${isAr ? "font-ar" : "font-en"}`}
              style={{ fontSize: "clamp(28px,4vw,52px)", color: "var(--color-primary-text)" }}>
              {dictionary.portfolio.title}
            </h1>
            <p className={`mt-4 mx-auto leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
              style={{ maxWidth: "500px", fontSize: "clamp(14px,1.5vw,16px)", color: "var(--color-secondary-text)" }}>
              {dictionary.portfolio.subtitle}
            </p>
          </div>
        </Reveal>

        
        <Reveal delay={80}>
          <div className={`flex flex-wrap gap-2 justify-center mb-12`}>
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveFilter(cat.key)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${isAr ? "font-ar" : "font-en"}`}
                style={activeFilter === cat.key ? {
                  background:   "linear-gradient(135deg,var(--color-primary),var(--color-accent))",
                  borderColor:  "transparent",
                  color:        "#fff",
                  boxShadow:    "0 4px 18px color-mix(in srgb,var(--color-primary) 38%,transparent)",
                  transform:    "translateY(-1px)",
                } : {
                  background:   "var(--color-card)",
                  borderColor:  "var(--color-border)",
                  color:        "var(--color-secondary-text)",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </Reveal>

        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <Reveal key={p.slug} delay={i * 60}>
              <ProjectCard
                slug={p.slug}
                title={p.title}
                summary={p.summary}
                category={p.category}
                emoji={p.emoji}
                gradient={p.gradient}
                accentColor={p.accentColor}
                tags={p.tags}
                lang={lang}
                ctaLabel={ctaLabel}
              />
            </Reveal>
          ))}
        </div>

        
        {filtered.length === 0 && (
          <div className="text-center py-20" style={{ color: "var(--color-secondary-text)" }}>
            <div className="text-5xl mb-4">🔍</div>
            <p className={isAr ? "font-ar" : "font-en"}>
              {isAr ? "لا توجد مشاريع في هذه الفئة حالياً" : "No projects in this category yet"}
            </p>
          </div>
        )}

        
        <Reveal delay={100}>
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 rounded-2xl p-8 border"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
            {[
              { value: "24+", label: isAr ? "مشروع منجز" : "Projects Delivered" },
              { value: "5",   label: isAr ? "مجالات"    : "Specializations"    },
              { value: "100%",label: isAr ? "رضا العملاء": "Client Satisfaction" },
              { value: "2x",  label: isAr ? "سرعة التسليم":"Faster Delivery"    },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="font-bold" style={{ fontSize: "clamp(24px,3vw,38px)", color: "var(--color-primary)", fontFamily: "var(--font-en)" }}>
                  {s.value}
                </div>
                <div className={`mt-1 text-sm ${isAr ? "font-ar" : "font-en"}`} style={{ color: "var(--color-secondary-text)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        
        <Reveal delay={120}>
          <div className="mt-14 text-center">
            <p className={`mb-6 text-lg font-medium ${isAr ? "font-ar" : "font-en"}`}
              style={{ color: "var(--color-secondary-text)" }}>
              {isAr ? "مشروعك القادم يستحق أفضل فريق" : "Your next project deserves the best team"}
            </p>
            <Link
              href={`/${lang}/contact`}
              className="apex-btn apex-btn-primary inline-flex items-center gap-3 px-10 py-3.5 rounded-full font-bold text-sm text-white"
            >
              {isAr ? "ابدأ مشروعك معنا" : "Start Your Project"}
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
