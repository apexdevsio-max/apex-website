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
  variable: "--font-en",
  display: "swap",
});
