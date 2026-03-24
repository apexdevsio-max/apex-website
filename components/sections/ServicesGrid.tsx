// file: components/sections/ServicesGrid.tsx
"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import type { Dictionary }  from "@/lib/i18n/i18n-types";
import type { Locale }      from "@/lib/i18n/locale";
import type { ServiceItem } from "@/lib/content/content-loader";

const MOCK_SERVICES = [
  { slug:"web-development",  emoji:"🌐", accentColor:"#00BCD4", gradient:"linear-gradient(135deg,#0f2027,#203a43)",
    ar:{ title:"تطوير الويب",           summary:"مواقع وتطبيقات ويب بأحدث التقنيات مع أداء استثنائي وتجربة مستخدم لا تُنسى.", ctaLabel:"ابدأ مشروع ويب" },
    en:{ title:"Web Development",       summary:"Websites and web apps with cutting-edge technology, exceptional performance, and unforgettable UX.", ctaLabel:"Start a Web Project" } },
  { slug:"mobile-apps",      emoji:"📱", accentColor:"#FFBF00", gradient:"linear-gradient(135deg,#0f0c29,#302b63)",
    ar:{ title:"تطبيقات الموبايل",      summary:"تطبيقات iOS وAndroid أصيلة وهجينة بتصاميم عصرية وأداء متميز.", ctaLabel:"ابنِ تطبيقك" },
    en:{ title:"Mobile Apps",           summary:"Native and hybrid iOS & Android apps with modern designs and superior performance.", ctaLabel:"Build Your App" } },
  { slug:"ai-solutions",     emoji:"🤖", accentColor:"#4DD0E1", gradient:"linear-gradient(135deg,#0d0d1a,#1a0533)",
    ar:{ title:"حلول الذكاء الاصطناعي", summary:"دمج AI في منتجاتك، أتمتة العمليات، وتحليل البيانات بأدوات الجيل القادم.", ctaLabel:"استكشف حلول AI" },
    en:{ title:"AI Solutions",          summary:"Integrate AI into your products, automate processes, and analyze data with next-gen tools.", ctaLabel:"Explore AI Solutions" } },
  { slug:"uiux-design",      emoji:"🎨", accentColor:"#5C6BC0", gradient:"linear-gradient(135deg,#141e30,#243b55)",
    ar:{ title:"تصميم UI/UX",           summary:"تصاميم احترافية مع دراسات حالة معمّقة تضمن تجربة مستخدم استثنائية.", ctaLabel:"صمّم معنا" },
    en:{ title:"UI/UX Design",          summary:"Professional designs with in-depth case studies ensuring an exceptional user experience.", ctaLabel:"Design With Us" } },
  { slug:"ecommerce",        emoji:"🛒", accentColor:"#FFBF00", gradient:"linear-gradient(135deg,#1a1a2e,#16213e)",
    ar:{ title:"المتاجر الإلكترونية",    summary:"منصات تجارية متكاملة مع بوابات دفع وإدارة مخزون وتحليلات مبيعات.", ctaLabel:"أطلق متجرك" },
    en:{ title:"E-Commerce",            summary:"Full commercial platforms with payment gateways, inventory management, and sales analytics.", ctaLabel:"Launch Your Store" } },
  { slug:"content-creation", emoji:"🎬", accentColor:"#4DD0E1", gradient:"linear-gradient(135deg,#0d1b2a,#1b263b)",
    ar:{ title:"صناعة المحتوى",         summary:"فيديوهات احترافية وريلز وتصاميم مدعومة بالذكاء الاصطناعي تُبهر جمهورك.", ctaLabel:"أنتج محتوى مميز" },
    en:{ title:"Content Creation",      summary:"Professional videos, reels, and AI-powered designs that captivate your audience.", ctaLabel:"Create Great Content" } },
];

/* ─── Reveal ────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{ opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(20px)",
        transition:`opacity 0.6s ${delay}ms ease, transform 0.6s ${delay}ms ease` }}>
      {children}
    </div>
  );
}

/* ─── Service card ──────────────────────────────────────── */
function ServiceCard({ service, lang, learnMore }: {
  service: typeof MOCK_SERVICES[0]; lang: Locale; learnMore: string;
}) {
  const isAr    = lang === "ar";
  const content = service[lang];
  const [hov, setHov] = useState(false);

  return (
    <Link href={`/${lang}/services/${service.slug}`}
      className="flex flex-col rounded-2xl overflow-hidden border transition-all duration-300"
      style={{
        background:     "var(--color-card)",
        borderColor:    hov ? service.accentColor : "var(--color-border)",
        transform:      hov ? "translateY(-6px)" : "translateY(0)",
        boxShadow:      hov ? `0 20px 50px color-mix(in srgb,${service.accentColor} 18%,transparent)` : "none",
        textDecoration: "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Thumbnail */}
      <div className="relative flex items-center justify-center"
        style={{ height:"156px", background:service.gradient }}>
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage:`linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.1) 1px,transparent 1px)`,
          backgroundSize:"22px 22px",
        }} aria-hidden="true" />
        <div className="absolute rounded-full pointer-events-none"
          style={{ width:"140px",height:"140px",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
            background:`radial-gradient(circle,${service.accentColor}30 0%,transparent 70%)` }}
          aria-hidden="true" />
        <span style={{ fontSize:"52px", filter:"drop-shadow(0 0 16px rgba(255,255,255,0.28))",
          transition:"transform 0.3s", transform:hov?"scale(1.1)":"scale(1)" }}>
          {service.emoji}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-6" dir={isAr?"rtl":"ltr"}>
        <h2 className={`font-bold mb-2 ${isAr?"font-ar":"font-en"}`}
          style={{ fontSize:"16px", color:"var(--color-primary-text)" }}>
          {content.title}
        </h2>
        <p className={`text-sm leading-relaxed flex-1 mb-5 ${isAr?"font-ar":"font-en"}`}
          style={{ color:"var(--color-secondary-text)" }}>
          {content.summary}
        </p>
        <div className={`flex items-center gap-2 font-bold text-sm border-t pt-4 ${isAr?"flex-row-reverse":""}`}
          style={{ color:service.accentColor, borderColor:"var(--color-border)" }}>
          {learnMore}
          <span className={`transition-transform duration-200 ${hov?(isAr?"-translate-x-1":"translate-x-1"):""} ${isAr?"rotate-180 inline-block":""}`}>→</span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Main component ────────────────────────────────────── */
export function ServicesGrid({ lang, dictionary, mdxItems }: {
  lang: Locale; dictionary: Dictionary; mdxItems: ServiceItem[];
}) {
  const isAr = lang === "ar";

  const services = mdxItems.length > 0
    ? mdxItems.map((item, i) => ({
        ...MOCK_SERVICES[i % MOCK_SERVICES.length],
        slug: item.slug,
        [lang]: { title: item.title, summary: item.summary, ctaLabel: item.ctaLabel },
      }))
    : MOCK_SERVICES;

  const STEPS = isAr
    ? [ { num:"01", title:"الفكرة",   desc:"نستمع لفكرتك ونحللها بعمق" },
        { num:"02", title:"التخطيط",  desc:"نضع خطة تنفيذية واضحة" },
        { num:"03", title:"التطوير",  desc:"نبني المشروع بأعلى جودة" },
        { num:"04", title:"التسليم",  desc:"نسلّم ونتابع معك بعد الإطلاق" } ]
    : [ { num:"01", title:"Discovery", desc:"We listen and deeply analyze your idea" },
        { num:"02", title:"Planning",  desc:"We build a clear execution plan" },
        { num:"03", title:"Building",  desc:"We develop with top quality" },
        { num:"04", title:"Delivery",  desc:"We deliver and support post-launch" } ];

  return (
    <main className="min-h-screen pt-28 pb-24 px-6"
      style={{ background:"var(--color-background)" }} dir={isAr?"rtl":"ltr"}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <Reveal className="text-center mb-16">
          <span className="apex-section-label gold">{dictionary.services.badge}</span>
          <div className="apex-divider reverse" />
          <h1 className={`mt-5 font-bold leading-tight ${isAr?"font-ar":"font-en"}`}
            style={{ fontSize:"clamp(28px,4vw,52px)", color:"var(--color-primary-text)" }}>
            {dictionary.services.title}
          </h1>
          <p className={`mt-4 mx-auto leading-relaxed ${isAr?"font-ar":"font-en"}`}
            style={{ maxWidth:"520px", fontSize:"clamp(14px,1.5vw,16px)", color:"var(--color-secondary-text)" }}>
            {dictionary.services.subtitle}
          </p>
        </Reveal>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 70}>
              <ServiceCard service={s} lang={lang} learnMore={dictionary.services.learnMore} />
            </Reveal>
          ))}
        </div>

        {/* Process */}
        <Reveal delay={80}>
          <div className="rounded-3xl border p-10 mb-16"
            style={{ background:"color-mix(in srgb,var(--color-primary) 4%,var(--color-card))",
              borderColor:"color-mix(in srgb,var(--color-primary) 16%,transparent)" }}>
            <h2 className={`font-bold text-center mb-10 ${isAr?"font-ar":"font-en"}`}
              style={{ fontSize:"clamp(18px,2.5vw,26px)", color:"var(--color-primary-text)" }}>
              {isAr?"كيف نعمل معك؟":"How We Work With You"}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STEPS.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="font-bold mb-2 font-en"
                    style={{ fontSize:"36px", color:"color-mix(in srgb,var(--color-primary) 28%,transparent)", lineHeight:1 }}>
                    {step.num}
                  </div>
                  <div className="w-8 h-0.5 mx-auto mb-3 rounded-full"
                    style={{ background:"var(--color-primary)" }} aria-hidden="true" />
                  <h3 className={`font-bold mb-1 ${isAr?"font-ar":"font-en"}`}
                    style={{ fontSize:"15px", color:"var(--color-primary-text)" }}>
                    {step.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isAr?"font-ar":"font-en"}`}
                    style={{ color:"var(--color-secondary-text)" }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal delay={100} className="text-center">
          <p className={`mb-6 text-lg font-medium ${isAr?"font-ar":"font-en"}`}
            style={{ color:"var(--color-secondary-text)" }}>
            {isAr?"مشروعك يستحق أفضل فريق":"Your project deserves the best team"}
          </p>
          <Link href={`/${lang}/contact`}
            className="apex-btn inline-flex items-center gap-3 px-10 py-3.5 rounded-full font-bold text-sm text-white"
            style={{ background:"linear-gradient(135deg,var(--color-primary),var(--color-accent))",
              boxShadow:"0 8px 28px color-mix(in srgb,var(--color-primary) 38%,transparent)" }}>
            {isAr?"ابدأ مشروعك الآن":"Start Your Project Now"}
            <span className={isAr?"rotate-180 inline-block":""}>→</span>
          </Link>
        </Reveal>
      </div>
    </main>
  );
}