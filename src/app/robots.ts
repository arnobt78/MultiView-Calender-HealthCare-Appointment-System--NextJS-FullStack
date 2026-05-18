import type { MetadataRoute } from "next";

/**
 * Single robots source (no `public/robots.txt`).
 * Limits crawler exposure on auth/app shells — see `docs/VERCEL_PRODUCTION_GUARDRAILS.md`.
 * Vercel Dashboard: enable Bot Protection + AI Bots manually (not configurable in repo).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/_next/",
          "/api/",
          "/control-panel/",
          "/analytics/",
          "/insights/",
          "/patient-portal/",
          "/dashboard/",
          "/doctor-portal/",
          "/patients/",
          "/appointments/",
          "/categories/",
          "/doctors/",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "anthropic-ai",
          "Claude-Web",
        ],
        disallow: "/",
      },
    ],
    sitemap: "https://doctor-patient-calendar-appointment.vercel.app/sitemap.xml",
  };
}
