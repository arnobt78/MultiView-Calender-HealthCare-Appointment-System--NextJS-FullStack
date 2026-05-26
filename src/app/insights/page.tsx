// Insights Page - Server Component (async SSR)
// Pre-fetches scoped insights so AnalyticsPage seeds TanStack cache on first paint.

import type { Metadata } from "next";
import AnalyticsPage from "@/components/pages/AnalyticsPage";
import { getSessionUser } from "@/lib/session";
import { prefetchInsights } from "@/lib/server-prefetch";
import { getUserRole } from "@/lib/rbac";
import type { InsightsPayload } from "@/lib/insights-data";
import { parseInsightsQueryFromSearchParams } from "@/lib/insights-scope";

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

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InsightsRoute({ searchParams }: PageProps) {
  const session = await getSessionUser();
  let initialInsights: InsightsPayload | null = null;
  let viewerRole: string | null = null;
  const resolvedParams = await searchParams;

  if (session) {
    const role = await getUserRole(session.userId);
    viewerRole = role;
    const initialQuery = parseInsightsQueryFromSearchParams(resolvedParams, role);
    initialInsights = await prefetchInsights(session.userId, {
      query: initialQuery,
      role,
    });
    return (
      <AnalyticsPage
        initialInsights={initialInsights}
        initialQuery={initialQuery}
        viewerRole={viewerRole}
      />
    );
  }

  return (
    <AnalyticsPage
      initialInsights={initialInsights}
      initialQuery={parseInsightsQueryFromSearchParams({}, null)}
      viewerRole={viewerRole}
    />
  );
}
