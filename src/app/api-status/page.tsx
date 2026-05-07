// API Status Page - Server Component (SSR)
// Route entry point: exports page metadata and renders ApiStatusPage.
// Metadata moved here from the now-deleted api-status/layout.tsx.

import type { Metadata } from "next";
import ApiStatusPage from "@/components/pages/ApiStatusPage";

export const metadata: Metadata = {
  title: "API Status",
  description:
    "Check the health status and availability of all API endpoints in the Doctor Patient Calendar system. Monitor uptime, endpoint status, and deployment information.",
  keywords: [
    "API status",
    "health check",
    "endpoint status",
    "API monitoring",
    "system status",
    "uptime",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <ApiStatusPage />;
}
