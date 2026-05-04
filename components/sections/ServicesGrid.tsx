"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { ServiceItem } from "@/lib/content/content-loader";
import type { Dictionary } from "@/lib/i18n/i18n-types";
import type { Locale } from "@/lib/i18n/locale";

type ServiceCardContent = {
  title: string;
  summary: string;
  ctaLabel: string;
};

type ServiceCardItem = {
  slug: string;
  emoji: string;
  accentColor: string;
  gradient: string;
  content: ServiceCardContent;
};

const SERVICE_VISUALS = [
  {
    slug: "web-development",
    emoji: "🌐",
    accentColor: "#00BCD4",
    gradient: "linear-gradient(135deg,#0f2027,#203a43)",
    ar: {
      title: "تطوير الويب",
      summary: "مواقع وتطبيقات ويب سريعة وقابلة للتوسع بتجربة استخدام واضحة.",
      ctaLabel: "ابدأ مشروع ويب",
    },
    en: {
      title: "Web Development",
      summary: "Fast, scalable websites and web apps with polished user experience.",
      ctaLabel: "Start a Web Project",
    },
  },
  {
    slug: "mobile-apps",
    emoji: "📱",
    accentColor: "#FFBF00",
    gradient: "linear-gradient(135deg,#0f0c29,#302b63)",
    ar: {
      title: "تطبيقات الموبايل",
      summary: "تطبيقات iOS وAndroid أصلية أو هجينة بجودة تنفيذ عالية.",
      ctaLabel: "ابن تطبيقك",
    },
    en: {
      title: "Mobile Apps",
      summary: "Native and cross-platform iOS and Android apps built for growth.",
      ctaLabel: "Build Your App",
    },
  },
  {
    slug: "ai-solutions",
    emoji: "🤖",
    accentColor: "#4DD0E1",
    gradient: "linear-gradient(135deg,#0d0d1a,#1a0533)",
    ar: {
      title: "حلول الذكاء الاصطناعي",
      summary: "دمج عملي للذكاء الاصطناعي داخل المنتجات وسير العمل والبيانات.",
      ctaLabel: "استكشف حلول AI",
    },
    en: {
      title: "AI Solutions",
      summary: "Practical AI integration for products, workflows, and data operations.",
      ctaLabel: "Explore AI Solutions",
    },
  },
  {
    slug: "uiux-design",
    emoji: "🎨",
    accentColor: "#5C6BC0",
    gradient: "linear-gradient(135deg,#141e30,#243b55)",
    ar: {
      title: "تصميم UI/UX",
      summary: "واجهات مدروسة تجمع بين الوضوح الجمالي وسهولة الاستخدام.",
      ctaLabel: "صمّم معنا",
    },
    en: {
      title: "UI/UX Design",
      summary: "Thoughtful interfaces that balance clarity, aesthetics, and usability.",
      ctaLabel: "Design With Us",
    },
  },
  {
    slug: "ecommerce",
    emoji: "🛒",
    accentColor: "#FFBF00",
    gradient: "linear-gradient(135deg,#1a1a2e,#16213e)",
    ar: {
      title: "المتاجر الإلكترونية",
      summary: "متاجر متكاملة تدعم الدفع وإدارة المنتجات وتحسين التحويل.",
      ctaLabel: "أطلق متجرك",
    },
    en: {
      title: "E-Commerce",
      summary: "Commerce platforms with payments, product workflows, and conversion focus.",
      ctaLabel: "Launch Your Store",
    },
  },
  {
    slug: "content-creation",
    emoji: "🎬",
    accentColor: "#4DD0E1",
    gradient: "linear-gradient(135deg,#0d1b2a,#1b263b)",
    ar: {
      title: "صناعة المحتوى",
      summary: "محتوى بصري وفيديوهات تسويقية تدعم حضورك الرقمي وتواصلك.",
      ctaLabel: "أنشئ محتوى مميزًا",
    },
    en: {
      title: "Content Creation",
      summary: "Visual and video content tailored for modern digital marketing.",
      ctaLabel: "Create Great Content",
    },
  },
] as const;

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
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
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s ${delay}ms ease, transform 0.6s ${delay}ms ease`,
      }}
    >
      {children}
    </div>
  );
}

function ServiceCard({
  service,
  lang,
  learnMore,
}: {
  service: ServiceCardItem;
  lang: Locale;
  learnMore: string;
}) {
  const isAr = lang === "ar";
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/${lang}/services/${service.slug}`}
      className="apex-card-base flex flex-col overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        borderColor: hovered ? service.accentColor : "var(--color-border)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 20px 50px color-mix(in srgb,${service.accentColor} 18%,transparent)`
          : "none",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative flex items-center justify-center"
        style={{ height: "156px", background: service.gradient }}
      >
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)",
            backgroundSize: "22px 22px",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: "140px",
            height: "140px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            background: `radial-gradient(circle,${service.accentColor}30 0%,transparent 70%)`,
          }}
          aria-hidden="true"
        />
        <span
          style={{
            fontSize: "52px",
            filter: "drop-shadow(0 0 16px rgba(255,255,255,0.28))",
            transition: "transform 0.3s",
            transform: hovered ? "scale(1.1)" : "scale(1)",
          }}
        >
          {service.emoji}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6" dir={isAr ? "rtl" : "ltr"}>
        <h2
          className={`mb-2 font-bold ${isAr ? "font-ar" : "font-en"}`}
          style={{ fontSize: "16px", color: "var(--color-primary-text)" }}
        >
          {service.content.title}
        </h2>
        <p
          className={`mb-5 flex-1 text-sm leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
          style={{ color: "var(--color-secondary-text)" }}
        >
          {service.content.summary}
        </p>
        <div
          className={`apex-arrow flex items-center gap-2 border-t pt-4 text-sm font-bold ${
            hovered ? "apex-arrow-shift" : ""
          } ${isAr ? "flex-row-reverse" : ""}`}
          style={{ color: service.accentColor, borderColor: "var(--color-border)" }}
        >
          {learnMore}
        </div>
      </div>
    </Link>
  );
}

export function ServicesGrid({
  lang,
  dictionary,
  mdxItems,
}: {
  lang: Locale;
  dictionary: Dictionary;
  mdxItems: ServiceItem[];
}) {
  const isAr = lang === "ar";

  const services: ServiceCardItem[] =
    mdxItems.length > 0
      ? mdxItems.map((item, index) => {
          const visual = SERVICE_VISUALS[index % SERVICE_VISUALS.length];
          return {
            slug: item.slug,
            emoji: visual.emoji,
            accentColor: visual.accentColor,
            gradient: visual.gradient,
            content: {
              title: item.title,
              summary: item.summary,
              ctaLabel: item.ctaLabel,
            },
          };
        })
      : SERVICE_VISUALS.map((item) => ({
          slug: item.slug,
          emoji: item.emoji,
          accentColor: item.accentColor,
          gradient: item.gradient,
          content: item[lang],
        }));

  const steps = isAr
    ? [
        { num: "01", title: "الفكرة", desc: "نستمع لفكرتك ونحللها من زاوية المنتج والتنفيذ." },
        { num: "02", title: "التخطيط", desc: "نحوّل المتطلبات إلى خطة واضحة ونطاق عمل قابل للتنفيذ." },
        { num: "03", title: "التطوير", desc: "نبني الحل بجودة عالية مع مراجعة مستمرة للتفاصيل." },
        { num: "04", title: "الإطلاق", desc: "نطلق المنتج ونتابع معك بعد التسليم والتحسين." },
      ]
    : [
        { num: "01", title: "Discovery", desc: "We understand the idea and frame it from a product and delivery lens." },
        { num: "02", title: "Planning", desc: "We turn requirements into a clear execution plan and realistic scope." },
        { num: "03", title: "Build", desc: "We implement with care, consistency, and attention to detail." },
        { num: "04", title: "Launch", desc: "We launch, support, and keep improving after delivery." },
      ];

  return (
    <main
      className="min-h-screen px-6 pb-24 pt-28"
      style={{ background: "var(--color-background)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-16 text-center">
          <span className="apex-section-label gold">{dictionary.services.badge}</span>
          <div className="apex-divider reverse" />
          <h1
            className={`mt-5 font-bold leading-tight ${isAr ? "font-ar" : "font-en"}`}
            style={{ fontSize: "clamp(28px,4vw,52px)", color: "var(--color-primary-text)" }}
          >
            {dictionary.services.title}
          </h1>
          <p
            className={`mx-auto mt-4 leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
            style={{
              maxWidth: "520px",
              fontSize: "clamp(14px,1.5vw,16px)",
              color: "var(--color-secondary-text)",
            }}
          >
            {dictionary.services.subtitle}
          </p>
        </Reveal>

        <div className="mb-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.slug} delay={index * 70}>
              <ServiceCard
                service={service}
                lang={lang}
                learnMore={dictionary.services.learnMore}
              />
            </Reveal>
          ))}
        </div>

        <Reveal delay={80}>
          <div
            className="mb-16 rounded-3xl border p-10"
            style={{
              background:
                "color-mix(in srgb,var(--color-primary) 4%,var(--color-card))",
              borderColor:
                "color-mix(in srgb,var(--color-primary) 16%,transparent)",
            }}
          >
            <h2
              className={`mb-10 text-center font-bold ${isAr ? "font-ar" : "font-en"}`}
              style={{ fontSize: "clamp(18px,2.5vw,26px)", color: "var(--color-primary-text)" }}
            >
              {isAr ? "كيف نعمل معك" : "How We Work With You"}
            </h2>
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {steps.map((step) => (
                <div key={step.num} className="text-center">
                  <div
                    className="mb-2 font-en font-bold"
                    style={{
                      fontSize: "36px",
                      color: "color-mix(in srgb,var(--color-primary) 28%,transparent)",
                      lineHeight: 1,
                    }}
                  >
                    {step.num}
                  </div>
                  <div
                    className="mx-auto mb-3 h-0.5 w-8 rounded-full"
                    style={{ background: "var(--color-primary)" }}
                    aria-hidden="true"
                  />
                  <h3
                    className={`mb-1 font-bold ${isAr ? "font-ar" : "font-en"}`}
                    style={{ fontSize: "15px", color: "var(--color-primary-text)" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed ${isAr ? "font-ar" : "font-en"}`}
                    style={{ color: "var(--color-secondary-text)" }}
                  >
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={100} className="text-center">
          <p
            className={`mb-6 text-lg font-medium ${isAr ? "font-ar" : "font-en"}`}
            style={{ color: "var(--color-secondary-text)" }}
          >
            {isAr ? "مشروعك يستحق فريقًا يعرف كيف ينفذ" : "Your project deserves a team that can execute well"}
          </p>
          <Link
            href={`/${lang}/contact`}
            className="apex-btn apex-btn-primary apex-arrow inline-flex items-center gap-3 rounded-full px-10 py-3.5 text-sm font-bold text-white"
          >
            {isAr ? "ابدأ مشروعك الآن" : "Start Your Project Now"}
          </Link>
        </Reveal>
      </div>
    </main>
  );
}
