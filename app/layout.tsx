import type { Metadata } from "next";
import { headers } from "next/headers";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { ibmPlexSansArabic, ibmPlexSerif } from "@/lib/fonts";
import { metadataBase } from "@/lib/seo/metadata";

import "./globals.css";

export const metadata: Metadata = { metadataBase };

  const themeScript = `
  (function () {
    try {
      var stored = localStorage.getItem("theme");
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      } else if (stored === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
    } catch (e) {}
  })();
`;

const cssDeferScript = `
  (function() {
    var links = document.querySelectorAll('link[rel="stylesheet"]');
    for (var i = 0; i < links.length; i++) {
      var m = links[i].media || 'all';
      links[i].media = 'print';
      links[i].onload = function() { this.media = m; };
      if (links[i].addEventListener) {
        links[i].addEventListener('load', function() { this.media = m; });
      }
    }
  })();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localeHeader = (await headers()).get("x-locale");
  const lang = localeHeader === "ar" || localeHeader === "en" ? localeHeader : "en";

  return (
    <html suppressHydrationWarning lang={lang}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: cssDeferScript }} />
        <style dangerouslySetInnerHTML={{
          __html: `
:root{--color-background:#fff;--color-card:#f8f9fa;--color-primary-text:#1b1b1b;--color-secondary-text:#555;--color-primary:#3f51b5;--color-primary-light:#5c6bc0;--color-accent:#1e88e5;--color-border:#e0e0e0;--color-gold:#ffbf00;--color-footer-bg:#111;--color-footer-heading:#eee;--color-footer-text:#ccc;--color-footer-text-muted:#aaa;--color-footer-border:#2a2a2a;--color-footer-primary:#7986cb;--color-lang-pill-text:#1b1b1b;--color-lang-pill-border:#c7a600;--color-lang-pill-bg:#fff4bf}
.dark{--color-background:#121212;--color-card:#1e1e1e;--color-primary-text:#e0e0e0;--color-secondary-text:#aaa;--color-primary:#00bcd4;--color-primary-light:#26c6da;--color-accent:#4dd0e1;--color-border:#2c2c2c;--color-gold:#ffbf00;--color-footer-bg:#0a0a0a;--color-footer-heading:#f5f5f5;--color-footer-text:#d4d4d4;--color-footer-text-muted:#9e9e9e;--color-footer-border:#1e1e1e;--color-footer-primary:#00bcd4;--color-lang-pill-text:#ffbf00;--color-lang-pill-border:#806200;--color-lang-pill-bg:#2a2200}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
html,body{background-color:var(--color-background);color:var(--color-primary-text);transition:background-color .3s ease,color .3s ease;overflow-x:hidden}
[dir="rtl"]{text-align:right;direction:rtl}
[dir="rtl"] .flex-row{flex-direction:row-reverse}
[dir="rtl"] .flex-row-reverse{flex-direction:row}
.font-ar{font-family:var(--font-ar),sans-serif}
.font-en{font-family:var(--font-en),serif}
.apex-section-title{font-size:clamp(28px,3.9vw,52px);color:var(--color-primary-text)}
.apex-section-subtitle{font-size:clamp(14px,1.6vw,17px);color:var(--color-secondary-text)}
          `,
        }} />
      </head>
      <body className={`${ibmPlexSansArabic.variable} ${ibmPlexSerif.variable} antialiased`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
