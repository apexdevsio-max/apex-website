import type { Metadata } from "next";
import { openGraph } from "./openGraph";

export const metadata: Metadata = {
  title: "APEX",
  description: "APEX Digital Studio",
  metadataBase: new URL("https://apex-tech.sa"),
  openGraph,
  twitter: {
    card: "summary_large_image",
    title: "APEX",
    description: "APEX Digital Studio",
    images: ["/images/Apex_logo.png"],
  },
};
