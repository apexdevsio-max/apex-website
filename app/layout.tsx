import "./globals.css";
import { ibmPlexSerif, reemKufi } from "@/lib/fonts";
import type { Metadata } from "next";
import { metadataBase } from "@/lib/seo/metadata";
import { headers } from "next/headers";

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
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      }
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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link id="noncritical-css" rel="stylesheet" href="/noncritical.css" media="print" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){var l=document.getElementById("noncritical-css");if(l){l.addEventListener("load",function(){l.media="all";});}})();',
          }}
        />
        <noscript>
          <link rel="stylesheet" href="/noncritical.css" />
        </noscript>
      </head>
      <body className={`${reemKufi.variable} ${ibmPlexSerif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
