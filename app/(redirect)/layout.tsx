import type { Metadata } from "next";

import { metadataBase, siteUrl } from "@/lib/seo/metadata";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase,
  title: "APEX — Software Company",
  description: "APEX builds mobile apps, websites, AI solutions, and e-commerce platforms.",
  alternates: { canonical: `${siteUrl}/en` },
};

export default function RedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
