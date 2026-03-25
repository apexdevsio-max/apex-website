import localFont from "next/font/local";

export const reemKufi = localFont({
  src: [
    {
      path: "../fonts/ReemKufi-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/ReemKufi-Bold.ttf",
      weight: "700",
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
      path: "../fonts/IBMPlexSerif-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/IBMPlexSerif-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  fallback: ["Times New Roman", "serif"],
  adjustFontFallback: "Times New Roman",
  variable: "--font-en",
  display: "swap",
});
