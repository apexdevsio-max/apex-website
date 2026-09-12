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
  // A NormalModuleReplacementPlugin aimed at /polyfill-module/ was removed from
  // here once, on the finding that it "never removed a single byte". That finding
  // was right about the file it was blamed for and wrong about the one it hit.
  //
  // Two different polyfill bundles ship with Next:
  //
  //   polyfill-nomodule — the ~112 KB `polyfills-<hash>.js`. Injected by
  //     CopyFilePlugin, which copies it by path and registers it in
  //     buildManifest.polyfillFiles (next/dist/build/webpack-config.js:1735). A
  //     copied asset never passes through module resolution, so no replacement
  //     regex can touch it. It is also served only to engines that fail the
  //     module/nomodule test, i.e. essentially IE11, so it costs this project
  //     nothing. That much of the original note stands.
  //
  //   polyfill-module — a 1.4 KB module `require`d by the client entry
  //     (client/app-index.js -> client/app-globals.js -> polyfills/polyfill-module).
  //     That IS a normal require, it DOES pass through module resolution, and it
  //     lands inline in the shared App Router chunk on every page.
  //
  // The plugin was hitting the second one. Removing it put the 1.4 KB back.
  //
  // Every feature it patches is supported across this project's browserslist
  // (chrome/edge/firefox >= 100, safari/ios >= 16.4): trimStart/trimEnd,
  // Symbol.description, Array.flat/flatMap, Promise.finally, Object.fromEntries,
  // Array.prototype.at, Object.hasOwn. The one exception is URL.canParse, which
  // needs Safari 17 and would genuinely be missing on 16.4 — but nothing calls
  // it: across every built chunk it is assigned once and invoked zero times.
  //
  // Re-check this when bumping Next, since the contents of polyfill-module and
  // the set of callers are both Next's to change.
  // `webpack` is the instance Next passes in, so this uses Next's own bundled
  // copy rather than adding webpack as a direct dependency.
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /[\/]polyfills[\/]polyfill-module/,
        path.resolve(projectRoot, "lib/build/empty-polyfill.js")
      )
    );
    return config;
  },
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
