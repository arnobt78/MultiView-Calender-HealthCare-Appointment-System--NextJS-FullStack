import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security-headers";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // User fallback avatars in control-panel tables.
      { protocol: "https", hostname: "robohash.org", pathname: "/**" },
    ],
  },
  async headers() {
    const rules = [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];

    if (isProd) {
      rules.push({
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      });
    }

    return rules;
  },
};

export default nextConfig;
