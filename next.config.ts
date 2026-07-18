import path from "path";
import type { NextConfig } from "next";

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
  webpack: (config, { webpack: wp, isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new wp.NormalModuleReplacementPlugin(
          /polyfill-module/,
          path.join(__dirname, 'lib/polyfill-empty.js')
        )
      );
    }
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
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://vitals.vercel-analytics.com https://vitals.vercel-insights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://www.google-analytics.com; font-src 'self' data:; media-src 'self'; connect-src 'self' https://*.google-analytics.com https://vitals.vercel-analytics.com https://vitals.vercel-insights.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; worker-src 'self' blob:; upgrade-insecure-requests",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
