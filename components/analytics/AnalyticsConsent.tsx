"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { readStorage, writeStorage } from "@/lib/browser";
import type { Locale } from "@/lib/i18n/locale";

type Consent = "granted" | "denied" | null;
const STORAGE_KEY = "analytics-consent";

/** Dispatched by the footer's "Privacy settings" button to reopen the banner. */
export const CONSENT_RESET_EVENT = "apex:consent-reset";

// Overridable per deployment; the literal is the site's existing GA4 property.
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-TFJWH33D6R";

/**
 * gtag.js only treats `Arguments` objects in the dataLayer as commands. The
 * previous arrow-function shim pushed plain arrays, which gtag ignores, so no hit
 * was ever sent even after a visitor consented.
 */
function installGtag() {
  window.dataLayer = window.dataLayer ?? [];
  if (typeof window.gtag === "function") return;
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params -- gtag.js requires the Arguments object
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false, anonymize_ip: true });
}

const COPY = {
  en: {
    label: "Privacy settings",
    body: "We use optional analytics (Google Analytics and Vercel Speed Insights) to understand how the site performs. Neither loads unless you accept.",
    accept: "Accept",
    decline: "Decline",
    policy: "Privacy policy",
  },
  ar: {
    label: "إعدادات الخصوصية",
    body: "نستخدم أدوات تحليل اختيارية (Google Analytics وVercel Speed Insights) لفهم أداء الموقع. لا يُحمَّل أي منها قبل موافقتك.",
    accept: "موافق",
    decline: "رفض",
    policy: "سياسة الخصوصية",
  },
} as const;

export function AnalyticsConsent({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);
  const t = COPY[lang];

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = readStorage(STORAGE_KEY);
      setConsent(stored === "granted" || stored === "denied" ? stored : null);
      setReady(true);
    });
    const reopen = () => setConsent(null);
    window.addEventListener(CONSENT_RESET_EVENT, reopen);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(CONSENT_RESET_EVENT, reopen);
    };
  }, []);

  // Commands queue in the dataLayer until gtag.js arrives, so page views are
  // recorded even when the script loads after the first navigation.
  useEffect(() => {
    if (consent !== "granted" || !ready) return;
    installGtag();
    window.gtag!("event", "page_view", { page_path: pathname });
  }, [consent, pathname, ready]);

  const choose = (value: Exclude<Consent, null>) => {
    writeStorage(STORAGE_KEY, value);
    // Withdrawing consent mid-session stops further collection immediately; the
    // scripts themselves are gone on the next page load.
    if (value === "denied" && typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "denied" });
    }
    setConsent(value);
  };

  return (
    <>
      {consent === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
          <SpeedInsights />
        </>
      )}
      {ready && consent === null && (
        <aside
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-2xl rounded-2xl border p-4 shadow-2xl"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
          dir={lang === "ar" ? "rtl" : "ltr"}
          aria-label={t.label}
          role="region"
        >
          <p className="text-sm leading-relaxed">
            {t.body}{" "}
            <a href={`/${lang}/privacy`} className="underline underline-offset-2">
              {t.policy}
            </a>
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button type="button" onClick={() => choose("granted")} className="apex-btn-primary min-h-[44px] rounded-full px-6 text-sm font-bold">
              {t.accept}
            </button>
            <button
              type="button"
              onClick={() => choose("denied")}
              className="min-h-[44px] rounded-full border px-6 text-sm font-bold"
              style={{ borderColor: "var(--color-border)" }}
            >
              {t.decline}
            </button>
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
