// Insights Page - Server Component (async SSR)
// Shares AnalyticsPage component with /analytics.
// Pre-fetches insights data so AnalyticsPage seeds the TanStack Query cache
// on first render — charts and stat cards render from cache, no loading flash.

import type { Metadata } from "next";
import AnalyticsPage from "@/components/pages/AnalyticsPage";
import { getSessionUser } from "@/lib/session";
import { prefetchInsights } from "@/lib/server-prefetch";
import { getUserRole, isDoctorRole } from "@/lib/rbac";
import type { InsightsPayload } from "@/lib/insights-data";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Explore data-driven insights for appointments, categories, patients, and usage trends in the Doctor Patient Calendar system.",
  keywords: [
    "insights",
    "analytics",
    "appointment data",
    "calendar insights",
    "patient statistics",
  ],
  robots: {
    index: false,
    follow: false,
  },
};

export default async function InsightsRoute() {
  const session = await getSessionUser();
  let initialInsights: InsightsPayload | null = null;
  if (session) {
    // Match the same scoping logic as GET /api/insights:
    // doctors see only their own appointments; admin/secretary see global data.
    const role = await getUserRole(session.userId);
    const ownOnly = isDoctorRole(role);
    initialInsights = await prefetchInsights(session.userId, { ownOnly });
  }
  return <AnalyticsPage initialInsights={initialInsights} />;
}
