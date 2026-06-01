import type { Metadata } from "next";

import { siteUrl } from "./metadata";

export const openGraph: NonNullable<Metadata["openGraph"]> = {
  title: "APEX",
  description: "APEX — Software Company | Mobile Apps, Web Development, AI Solutions & UI/UX Design",
  type: "website",
  images: [
    {
      url: `${siteUrl}/images/Apex_logo.png`,
      width: 1200,
      height: 630,
      alt: "APEX",
    },
  ],
};
