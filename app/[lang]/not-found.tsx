// file: app/[lang]/not-found.tsx  (أو app/not-found.tsx)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isLocale } from "@/lib/i18n/locale";

export default function NotFoundPage() {
  const pathname = usePathname();
  const segment  = pathname?.split("/")[1] ?? "en";
  const lang     = isLocale(segment) ? segment : "en";
  const isAr     = lang === "ar";

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "var(--color-background)" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Ambient glow */}
      <div className="absolute rounded-full pointer-events-none" aria-hidden="true"
        style={{
          width:"500px", height:"500px",
          top:"50%", left:"50%", transform:"translate(-50%,-50%)",
          background:"radial-gradient(circle,color-mix(in srgb,var(--color-primary) 8%,transparent) 0%,transparent 70%)",
        }} />

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40" aria-hidden="true"
        style={{
          backgroundImage:`linear-gradient(var(--color-border) 1px,transparent 1px),linear-gradient(90deg,var(--color-border) 1px,transparent 1px)`,
          backgroundSize:"60px 60px",
        }} />

      <section className="relative z-1 text-center max-w-lg">

        {/* 404 — giant decorative */}
        <div className="font-bold leading-none mb-2 select-none font-en"
          style={{
            fontSize:"clamp(120px,22vw,180px)",
            background:"linear-gradient(135deg,var(--color-primary),var(--color-accent))",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            opacity:0.12,
          }}
          aria-hidden="true">
          404
        </div>

        {/* Icon */}
        <div className="text-6xl -mt-10 mb-6">🔍</div>

        {/* Label */}
        <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3 font-en"
          style={{ color:"var(--color-primary)" }}>
          Error 404
        </p>

        {/* Heading */}
        <h1 className={`font-bold mb-4 leading-tight ${isAr?"font-ar":"font-en"}`}
          style={{ fontSize:"clamp(24px,4vw,40px)", color:"var(--color-primary-text)" }}>
          {isAr ? "الصفحة غير موجودة" : "Page Not Found"}
        </h1>

        {/* Description */}
        <p className={`mb-10 leading-relaxed ${isAr?"font-ar":"font-en"}`}
          style={{ color:"var(--color-secondary-text)", fontSize:"15px" }}>
          {isAr
            ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر."
            : "The page you're looking for doesn't exist or has been moved."}
        </p>

        {/* CTAs */}
        <div className={`flex flex-wrap gap-3 justify-center ${isAr?"flex-row-reverse":""}`}>
          <Link href={`/${lang}`}
            className="apex-btn inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm text-white"
            style={{
              background:"linear-gradient(135deg,var(--color-primary),var(--color-accent))",
              boxShadow:"0 8px 28px color-mix(in srgb,var(--color-primary) 38%,transparent)",
            }}>
            {isAr ? "العودة للرئيسية" : "Go Home"}
            <span className={isAr?"rotate-180 inline-block":""}>→</span>
          </Link>

          <Link href={`/${lang}/contact`}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm border-2"
            style={{ color:"var(--color-primary)", borderColor:"var(--color-primary)" }}>
            {isAr ? "تواصل معنا" : "Contact Us"}
          </Link>
        </div>

        {/* Quick links */}
        <div className="mt-10 pt-8 border-t" style={{ borderColor:"var(--color-border)" }}>
          <p className={`text-xs mb-4 ${isAr?"font-ar":"font-en"}`}
            style={{ color:"var(--color-secondary-text)" }}>
            {isAr ? "ربما تجد ما تبحث عنه هنا:" : "You might find what you're looking for here:"}
          </p>
          <div className={`flex flex-wrap gap-2 justify-center ${isAr?"flex-row-reverse":""}`}>
            {[
              { path:"portfolio", ar:"أعمالنا",    en:"Portfolio" },
              { path:"services",  ar:"خدماتنا",    en:"Services"  },
              { path:"academy",   ar:"الأكاديمية", en:"Academy"   },
              { path:"blog",      ar:"المدونة",    en:"Blog"      },
            ].map((link) => (
              <Link key={link.path} href={`/${lang}/${link.path}`}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${isAr?"font-ar":"font-en"}`}
                style={{ background:"var(--color-card)", borderColor:"var(--color-border)", color:"var(--color-secondary-text)" }}>
                {isAr ? link.ar : link.en}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}