"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import type { Locale } from "@/lib/i18n/locale";

type Consent = "granted" | "denied" | null;
const STORAGE_KEY = "analytics-consent";
const GA_ID = "G-TFJWH33D6R";

export function AnalyticsConsent({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      setConsent(stored === "granted" || stored === "denied" ? stored : null);
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (consent !== "granted" || !ready || typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", { page_path: pathname });
  }, [consent, pathname, ready]);

  const choose = (value: Exclude<Consent, null>) => {
    localStorage.setItem(STORAGE_KEY, value);
    setConsent(value);
  };

  return (
    <>
      {consent === "granted" && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          // gtag.js is ~160 KB transferred and none of it is needed to render or
          // hydrate the page. `afterInteractive` still injects it during hydration,
          // where it competes with the app's own JS for main-thread time on the
          // critical path. `lazyOnload` defers it to the browser's idle time after
          // load, which keeps it out of LCP/FCP entirely — analytics losing a second
          // costs nothing, unlike the paint it was delaying.
          strategy="lazyOnload"
          onLoad={() => {
            window.dataLayer = window.dataLayer ?? [];
            window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
            window.gtag("js", new Date());
            window.gtag("config", GA_ID, { send_page_view: false, anonymize_ip: true });
            window.gtag("event", "page_view", { page_path: pathname });
          }}
        />
      )}
      {ready && consent === null && (
        <aside className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-2xl rounded-2xl border p-4 shadow-2xl" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }} dir={lang === "ar" ? "rtl" : "ltr"} aria-label={lang === "ar" ? "إعدادات الخصوصية" : "Privacy settings"}>
          <p className={lang === "ar" ? "font-ar text-sm" : "font-en text-sm"}>
            {lang === "ar" ? "نستخدم تحليلات اختيارية لفهم أداء الموقع. لن تُحمّل قبل موافقتك." : "We use optional analytics to understand site performance. They will not load without your consent."}
          </p>
          <div className="mt-3 flex gap-3">
            <button type="button" onClick={() => choose("granted")} className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{ background: "var(--color-primary)" }}>{lang === "ar" ? "موافق" : "Accept"}</button>
            <button type="button" onClick={() => choose("denied")} className="rounded-full border px-5 py-2 text-sm font-bold" style={{ borderColor: "var(--color-border)" }}>{lang === "ar" ? "رفض" : "Decline"}</button>
          </div>
        </aside>
      )}
    </>
  );
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
