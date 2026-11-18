import path from "path";
import type { NextConfig } from "next";

import { CSP_HEADER_VALUE } from "./lib/seo/csp";

const projectRoot = path.resolve(process.cwd());

/**
 * True only in the top-level `next build` process.
 *
 * The config module is loaded by several processes per build: the `prebuild`
 * typegen run, the build parent, and one jest-worker child per static-generation
 * worker. A module-scoped or globalThis flag cannot dedupe across them because
 * each is a separate process, so the entrypoint is identified by argv instead —
 * worker children run `jest-worker/processChild.js` and are excluded.
 */
function isBuildEntrypoint(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  const argv = process.argv.join(" ");
  if (argv.includes("processChild")) return false;
  return /[\\/]next(?:\.js)?$/.test(process.argv[1] ?? "") && process.argv.includes("build");
}

/**
 * Surfaces an incomplete public identity in the build log.
 *
 * data/social-links.ts falls back to a gmail.com address and to blank social
 * profiles, which means `sameAs` is omitted from the Organization JSON-LD. Both
 * are legitimate defaults — a preview deploy or a fresh clone must still build —
 * but they are otherwise invisible: an unconfigured production deploy looks
 * exactly like a configured one, so the gap survives every green build and only
 * shows up later as weak entity signals.
 *
 * This lives in the config rather than in the data module because a data module is
 * re-imported by every static-generation worker. The config is not evaluated once
 * either — `next typegen`, the build parent, and each jest-worker child all load
 * it (five processes on this project) — so `isBuildEntrypoint` narrows it to the
 * one process that is actually the build.
 */
function warnOnPlaceholderIdentity(): void {
  const gaps: string[] = [];

  if (!process.env.NEXT_PUBLIC_CONTACT_EMAIL) {
    gaps.push("NEXT_PUBLIC_CONTACT_EMAIL (falls back to a gmail.com address)");
  }
  if (
    !process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM &&
    !process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN &&
    !process.env.NEXT_PUBLIC_SOCIAL_TWITTER
  ) {
    gaps.push("NEXT_PUBLIC_SOCIAL_* (all blank, so Organization `sameAs` is omitted)");
  }

  if (gaps.length > 0) {
    console.warn(
      "[apex] Public identity is incomplete; entity signals are weakened:\n" +
        gaps.map((gap) => `  - ${gap}`).join("\n") +
        "\nSet these in the deployment environment. See .env.example."
    );
  }
}

if (isBuildEntrypoint()) warnOnPlaceholderIdentity();

// www.apex.sy has no DNS record today. Add a CNAME for it at the DNS provider and
// attach it to the Vercel project as a redirect to apex.sy; nothing in this file
// can create a hostname that does not resolve.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
    deviceSizes: [320, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 96, 128, 256, 384],
    qualities: [40, 50, 60, 75],
    dangerouslyAllowSVG: false,
  },
  outputFileTracingRoot: projectRoot,
  // The social cards read their fonts and content from disk. Listing them here
  // keeps them in the deployed function even when a card is rendered on demand.
  outputFileTracingIncludes: {
    "/[lang]/opengraph-image": ["./fonts/**/*.ttf"],
    "/[lang]/blog/[slug]/opengraph-image": ["./fonts/**/*.ttf", "./content/blog/**"],
    "/[lang]/services/[service]/opengraph-image": ["./fonts/**/*.ttf", "./content/services/**"],
  },
  reactStrictMode: true,
  async redirects() {
    return [
      // /EN/blog -> /en/blog. Every non-lowercase spelling of each locale.
      ...["EN", "En", "eN", "AR", "Ar", "aR"].flatMap((variant) => [
        { source: `/${variant}`, destination: `/${variant.toLowerCase()}`, permanent: true },
        { source: `/${variant}/:path*`, destination: `/${variant.toLowerCase()}/:path*`, permanent: true },
      ]),
      // Old portfolio category URLs. Handled here so they answer with a real 308
      // instead of a 200 page carrying a meta refresh.
      {
        source: "/:lang(en|ar)/portfolio/category/:slug",
        destination: "/:lang/portfolio",
        permanent: true,
      },
      // Five near-identical city pages were merged into one honest guide.
      ...[
        "app-development-company-riyadh",
        "app-development-jeddah",
        "app-development-abu-dhabi",
        "web-design-company-dubai",
        "software-company-qatar",
      ].map((slug) => ({
        source: `/:lang(en|ar)/blog/${slug}`,
        destination: "/:lang/blog/gulf-app-development-guide",
        permanent: true,
      })),
      // Blog categories were rebuilt around topic clusters.
      ...[
        ["languages-frameworks", "mobile-development"],
        ["web-development", "web-ecommerce"],
        ["comparisons", "choosing-a-vendor"],
        ["selected-topics", "gulf-compliance"],
        ["practical-guides", "choosing-a-vendor"],
      ].flatMap(([from, to]) => [
        { source: `/:lang(en|ar)/blog/category/${from}`, destination: `/:lang/blog/category/${to}`, permanent: true },
        { source: `/:lang(en|ar)/blog/category/${from}/page/:page`, destination: `/:lang/blog/category/${to}`, permanent: true },
      ]),
      // The academy held placeholder lessons and was removed.
      { source: "/:lang(en|ar)/academy/:path*", destination: "/:lang/blog", permanent: true },
    ];
  },
  experimental: {
    globalNotFound: true,
    // Route matching is case-insensitive by default, both in Next and in the
    // routing rules Vercel generates from the routes manifest. That made the
    // proxy matcher skip /EN/... (so it 404'd) and would make the uppercase
    // redirects below also match /en/..., looping. Exact matching avoids both.
    caseSensitiveRoutes: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Next's polyfill-module (client/app-globals.js) is deliberately left in the
  // client bundle. It was once swapped for an empty module to save ~740 bytes
  // gzipped, on the grounds that every feature it patches (Array.prototype.at,
  // Object.hasOwn, Object.fromEntries, flat/flatMap, trimStart/trimEnd, ...) is
  // inside the browserslist. Real visitors are not: iPhones that never left
  // iOS 15.x and old Android WebViews still load the site, and without the
  // polyfills the first Next/React call to one of those methods throws and the
  // page lands on the error boundary. The bytes are not worth that.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Content-Security-Policy",
            value: CSP_HEADER_VALUE,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
