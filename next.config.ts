import path from "path";
import type { NextConfig } from "next";

import { CSP_HEADER_VALUE } from "./lib/seo/csp";

const projectRoot = path.resolve(process.cwd());

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
