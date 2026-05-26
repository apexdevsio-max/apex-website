import path from "path";
import type { NextConfig } from "next";

const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
    deviceSizes: [320, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 96, 128, 256, 384],
    qualities: [40, 50, 60, 75],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
  },
  outputFileTracingRoot: projectRoot,
  reactStrictMode: true,
  experimental: {
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
        ],
      },
    ];
  },
};

export default nextConfig;
