import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { notFound } from "next/navigation";

import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale } from "@/lib/i18n/locale";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ibmPlexSansArabic, ibmPlexSerif } from "@/lib/fonts";
import { metadataBase } from "@/lib/seo/metadata";
import { AnalyticsConsent } from "@/components/analytics/AnalyticsConsent";

import "../globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1216" },
  ],
};

export const metadata: Metadata = {
  metadataBase,
  title: { default: "APEX", template: "%s — APEX" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" },
  manifest: "/manifest.webmanifest",
};

// Applied before first paint so the stored/system colour scheme does not flash.
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
    <html suppressHydrationWarning lang={lang} dir={isAr ? "rtl" : "ltr"} data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* The Arabic family is only loaded on Arabic pages; next/font emits its @font-face rules with the variable class. */}
      <body className={`${isAr ? ibmPlexSansArabic.variable : ""} ${ibmPlexSerif.variable} ${isAr ? "font-ar" : "font-en"} antialiased`}>
      <a href="#content" className="apex-skip-link">
        {isAr ? "انتقل إلى المحتوى" : "Skip to content"}
      </a>
      {/* Reserves the space taken by the fixed header so content starts below it. */}
      <div
        data-header-placeholder
        className="w-full"
        style={{ height: "70px", flexShrink: 0 }}
      />

      <Header lang={lang} navigation={dictionary.navigation} />

      {/* Subtracts the header placeholder so a short page fills the viewport
          exactly instead of overflowing it by the header's height. */}
      <main
        id="content"
        tabIndex={-1}
        style={{ minBlockSize: "calc(100dvh - 70px)" }}
      >
        {children}
      </main>

      <Footer lang={lang} dictionary={dictionary} />
      <AnalyticsConsent lang={lang} />
      </body>
    </html>
  );
}
