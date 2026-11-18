"use client";

import Link from "next/link";

import type { Locale } from "@/lib/i18n/locale";

/** Error message with a retry and a way forward, in the visitor's language. */
export function ErrorContent({ lang, reset }: { lang: Locale; reset: () => void }) {
  const isAr = lang === "ar";
  return (
    <section lang={lang} dir={isAr ? "rtl" : "ltr"} className="mx-auto max-w-xl px-6 py-20 text-center">
      <h1 className="apex-page-title">{isAr ? "حدث خطأ غير متوقع" : "Something went wrong"}</h1>
      <p className="mt-4 text-lg text-apex-muted">
        {isAr
          ? "تعذّر عرض هذه الصفحة. حاول مجدداً، أو انتقل إلى الرئيسية، أو راسلنا إن تكررت المشكلة."
          : "This page could not be displayed. Try again, go to the home page, or message us if it keeps happening."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="apex-btn-primary">
          {isAr ? "حاول مجدداً" : "Try again"}
        </button>
        <Link href={`/${lang}`} className="apex-btn-outline">
          {isAr ? "الرئيسية" : "Home"}
        </Link>
        <Link href={`/${lang}/contact`} className="apex-btn-outline">
          {isAr ? "تواصل معنا" : "Contact"}
        </Link>
      </div>
    </section>
  );
}
