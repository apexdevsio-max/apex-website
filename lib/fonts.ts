import localFont from "next/font/local";

export const ibmPlexSansArabic = localFont({
  src: [
    {
      path: "../fonts/arabic/IBMPlexSansArabic-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/arabic/IBMPlexSansArabic-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/arabic/IBMPlexSansArabic-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  fallback: ["Arial", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
  variable: "--font-ar",
  display: "swap",
});

export const ibmPlexSerif = localFont({
  src: [
    {
      path: "../fonts/english/IBMPlexSerif-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/english/IBMPlexSerif-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  fallback: ["Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman",
  variable: "--font-en",
  display: "swap",
});
