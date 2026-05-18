import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security-headers";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Robohash fallbacks — `src/lib/doctor-avatar.ts`, `src/lib/patient-portrait.ts`.
      { protocol: "https", hostname: "robohash.org", pathname: "/**" },
      // User uploads via Vercel Blob — keep in sync with `src/lib/vercelBlob.ts` public URLs.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
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
