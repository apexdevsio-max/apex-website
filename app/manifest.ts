import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "APEX",
    short_name: "APEX",
    description: "Apps, websites and AI systems for businesses in Saudi Arabia, the UAE and Qatar.",
    start_url: "/",
    display: "browser",
    background_color: "#ffffff",
    theme_color: "#0b6aa8",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
