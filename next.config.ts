
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
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