import type { Metadata } from "next";

export const openGraph: NonNullable<Metadata["openGraph"]> = {
  title: "APEX",
  description: "APEX Digital Studio",
  type: "website",
  images: [
    {
      url: "/images/Apex_logo.png",
      width: 1200,
      height: 630,
      alt: "APEX",
    },
  ],
};
