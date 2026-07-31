import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale } from "@/lib/i18n/locale";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ibmPlexSansArabic, ibmPlexSerif } from "@/lib/fonts";
import { metadataBase, siteUrl } from "@/lib/seo/metadata";
import { AnalyticsConsent } from "@/components/analytics/AnalyticsConsent";

import "../globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export const metadata: Metadata = {
  metadataBase,
  title: { default: "APEX — Software Company", template: "%s — APEX" },
  description: "APEX builds mobile apps, websites, AI solutions, and e-commerce platforms.",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico", apple: "/favicon.ico" },
  alternates: {
    languages: { en: `${siteUrl}/en`, ar: `${siteUrl}/ar`, "x-default": `${siteUrl}/en` },
  },
};

// Applied before first paint so the stored/system colour scheme does not flash.
// Next.js stamps the CSP nonce from proxy.ts onto this script automatically.
const themeScript = `(function(){try{var stored=localStorage.getItem("theme");var dark=stored?stored==="dark":matchMedia("(prefers-color-scheme:dark)").matches;document.documentElement.classList.toggle("dark",dark)}catch(e){}})();`;

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "ar" }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: langParam } = await params;
  if (!isLocale(langParam)) notFound();

  const lang = langParam;
  const dictionary = await getDictionary(lang);
  const isAr = lang === "ar";

  return (
    <html suppressHydrationWarning lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <head>
        <link rel="preconnect" href="https://vitals.vercel-analytics.com" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Scroll-reveal animations are driven by an IntersectionObserver; without
            JS the observer never fires and the content would stay at opacity 0. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className={`${ibmPlexSansArabic.variable} ${ibmPlexSerif.variable} antialiased`}>
      {/* Reserves the space taken by the fixed header so content starts below it. */}
      <div
        data-header-placeholder
        className="w-full"
        style={{ height: "70px", flexShrink: 0 }}
      />

      <Header lang={lang} dictionary={dictionary} />

      {/* Subtracts the header placeholder so a short page fills the viewport
          exactly instead of overflowing it by the header's height. */}
      <main
        className={`${isAr ? "font-ar" : "font-en"}`}
        dir={isAr ? "rtl" : "ltr"}
        style={{ minBlockSize: "calc(100dvh - 70px)" }}
      >
        {children}
      </main>

      <Footer lang={lang} dictionary={dictionary} />
      <AnalyticsConsent lang={lang} />
      <SpeedInsights />
      </body>
    </html>
  );
}
