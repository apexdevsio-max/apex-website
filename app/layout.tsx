import type { Metadata } from "next";
import { headers } from "next/headers";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { ibmPlexSerif, reemKufi } from "@/lib/fonts";
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
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      }
    } catch (e) {}
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
        <link rel="preload" href="/_next/static/css/fb398caf5d919735.css" as="style" />
        <link rel="preload" href="/videos/robot_welcome.mp4" as="video" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${reemKufi.variable} ${ibmPlexSerif.variable} antialiased`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
