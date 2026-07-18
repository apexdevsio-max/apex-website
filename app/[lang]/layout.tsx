import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { getDictionary } from "@/lib/i18n/i18n";
import { isLocale } from "@/lib/i18n/locale";
import { Footer } from "@/components/layout/Footer";
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

const themeScript = `(function(){try{var stored=localStorage.getItem("theme");var dark=stored?stored==="dark":matchMedia("(prefers-color-scheme:dark)").matches;document.documentElement.classList.toggle("dark",dark)}catch(e){}})();`;

const Header = dynamic(
  () => import("@/components/layout/Header").then((m) => m.Header),
  {
    ssr: true,
    loading: () => (
      <div
        className="w-full border-b border-apex-border"
        style={{
          height: "70px",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "var(--color-background)",
        }}
      />
    ),
  }
);

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
      </head>
      <body className={`${ibmPlexSansArabic.variable} ${ibmPlexSerif.variable} antialiased`}>
      <div
        data-header-placeholder
        className="w-full"
        style={{ height: "70px", flexShrink: 0 }}
      />

      <Header lang={lang} dictionary={dictionary} />

      <main
        className={`${isAr ? "font-ar" : "font-en"}`}
        dir={isAr ? "rtl" : "ltr"}
        style={{ minHeight: "100vh", minBlockSize: "100dvh" }}
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
