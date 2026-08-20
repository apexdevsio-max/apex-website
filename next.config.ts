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

// Note: www → non-www redirect (apex.sy) must be configured at the CDN/server level (Vercel/Cloudflare),
// not in Next.js config. No redirect chains exist — the middleware handles locale detection in one hop.
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
  reactStrictMode: true,
  experimental: {
    globalNotFound: true,
    optimizePackageImports: ['lucide-react'],
    inlineCss: true,
    serverMinification: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // No `webpack` hook. There used to be a NormalModuleReplacementPlugin here aimed
  // at /polyfill-module/, intended to strip the ~112 KB `polyfills-<hash>.js` that
  // every page loads. It never removed a single byte: that chunk is Next's
  // `polyfill-nomodule` bundle, injected via CopyFilePlugin, which copies the file
  // to the output by path and registers it in `buildManifest.polyfillFiles`
  // (next/dist/build/webpack-config.js). A copied asset never passes through module
  // resolution, so no replacement regex can intercept it — the plugin looked like a
  // size optimisation while doing nothing, and its presence forced the whole build
  // onto the webpack path.
  //
  // Removing it is safe: Next serves this file only to engines that fail the
  // module/nomodule test (essentially IE11), so browsers in this project's
  // browserslist download it at most once from cache and parse none of it.
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
