import Link from "next/link";

import type { Locale } from "@/lib/i18n/locale";

const COPY = {
  en: {
    title: "Page not found",
    body: "The page may have moved or the address may be mistyped. These are the main sections:",
    links: [
      ["", "Home"],
      ["services", "Services"],
      ["portfolio", "Our work"],
      ["blog", "Blog"],
      ["contact", "Contact"],
    ],
  },
  ar: {
    title: "الصفحة غير موجودة",
    body: "ربما نُقلت الصفحة أو أن العنوان مكتوب بشكل خاطئ. هذه أقسام الموقع الرئيسية:",
    links: [
      ["", "الرئيسية"],
      ["services", "خدماتنا"],
      ["portfolio", "أعمالنا"],
      ["blog", "المدونة"],
      ["contact", "تواصل معنا"],
    ],
  },
} as const;

/** 404 body with a way forward, shared by the localized and the global not-found pages. */
export function NotFoundContent({ lang }: { lang: Locale }) {
  const t = COPY[lang];
  return (
    <section lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} className="mx-auto max-w-xl px-6 py-20 text-center">
      <p className="apex-stat mb-2">404</p>
      <h1 className="apex-page-title">{t.title}</h1>
      <p className="mt-4 text-lg text-apex-muted">{t.body}</p>
      <ul className="mt-8 flex flex-wrap justify-center gap-3">
        {t.links.map(([path, label]) => (
          <li key={path}>
            <Link href={path ? `/${lang}/${path}` : `/${lang}`} className={path === "contact" ? "apex-btn-primary" : "apex-btn-outline"}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
