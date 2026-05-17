import type { Metadata } from "next";

const OG_SITE_URL = "https://apex-tech.sa";

export const openGraph: NonNullable<Metadata["openGraph"]> = {
  title: "APEX",
  description: "APEX — Software Company | Mobile Apps, Web Development, AI Solutions & UI/UX Design",
  type: "website",
  images: [
    {
      url: `${OG_SITE_URL}/images/Apex_logo.png`,
      width: 1200,
      height: 630,
      alt: "APEX",
    },
  ],
};
