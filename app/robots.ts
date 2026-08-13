import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The contact endpoint is POST-only and has nothing to index.
      disallow: ["/api/"],
    },
    // No `host:` directive — it was only ever honoured by Yandex and is ignored by
    // Google and Bing. Canonical host selection is handled by the canonical tags in
    // lib/seo/metadata.ts and the www → non-www redirect at the CDN.
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
