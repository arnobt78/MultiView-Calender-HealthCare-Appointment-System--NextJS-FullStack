"use client";

/**
 * AnalyticsPage — Recharts insights dashboard:
 *   - Portal chrome + scope/period controls stay mounted
 *   - Overview stat row + domain sections pulse only data slots while loading
 *   - `isMounted` guard prevents hydration flicker on first paint
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useInsights } from "@/hooks/useInsights";
import type { InsightsPayload } from "@/lib/insights-data";
import { InsightsScopeControls } from "@/components/insights/InsightsScopeControls";
import { InsightsPeriodControls } from "@/components/insights/InsightsPeriodControls";
import {
  buildInsightsQueryString,
  defaultInsightsQueryForRole,
  type InsightsQueryKey,
} from "@/lib/insights-scope";
import type { InsightsPeriod } from "@/lib/insights/insights-period";
import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import { useUsers } from "@/hooks/useUsers";
import { AlertCircle, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { PortalChromeHeader } from "@/components/shared/PortalChromeHeader";
import { AnalyticsOverviewStatsRow } from "@/components/shared/analytics/AnalyticsOverviewStatsRow";
import { AnalyticsInsightsSections } from "@/components/shared/analytics/AnalyticsInsightsSections";

type AnalyticsPageProps = {
  /** SSR payload — seed queryKeys.insights.filter(initialQuery) before paint */
  initialInsights?: InsightsPayload | null;
  initialQuery?: InsightsQueryKey;
  viewerRole?: string | null;
};

export default function AnalyticsPage({
  initialInsights,
  initialQuery: initialQueryProp,
  viewerRole = null,
}: AnalyticsPageProps = {}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState<InsightsQueryKey>(
    () => initialQueryProp ?? defaultInsightsQueryForRole(viewerRole)
  );

  useLayoutEffect(() => {
    if (initialInsights != null && initialQueryProp) {
      queryClient.setQueryData(queryKeys.insights.filter(initialQueryProp), initialInsights);
      queryClient.setQueryData(queryKeys.analytics.all, initialInsights);
    }
  }, [queryClient, initialInsights, initialQueryProp]);

  const { data, isLoading, isFetching, isError } = useInsights(query);

  const { data: doctorsData, isLoading: doctorsLoading } = useUsers(
    { role: "doctor", limit: 200 },
    { enabled: isAdminRole(viewerRole) }
  );

  const adminDoctors = useMemo(
    () =>
      (doctorsData?.users ?? []).filter((u) => u.role === "doctor" || !u.role),
    [doctorsData?.users]
  );

  const syncUrl = useCallback(
    (next: InsightsQueryKey) => {
      const qs = buildInsightsQueryString(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router]
  );

  const handleFilterChange = useCallback(
    (nextScope: { scope: InsightsQueryKey["scope"]; doctorId?: string }) => {
      const next: InsightsQueryKey = { ...query, ...nextScope };
      setQuery(next);
      syncUrl(next);
    },
    [query, syncUrl]
  );

  const handlePeriodChange = useCallback(
    (period: InsightsPeriod) => {
      const next: InsightsQueryKey = { ...query, period };
      setQuery(next);
      syncUrl(next);
    },
    [query, syncUrl]
  );

  const scopeHint = useMemo(() => {
    if (query.scope === "organization") {
      return "Showing organization-wide metrics.";
    }
    if (isAdminRole(viewerRole) && query.doctorId) {
      const doctor = adminDoctors.find((u) => u.id === query.doctorId);
      const name =
        doctor?.display_name?.trim() || doctor?.email?.trim() || "selected doctor";
      return `Showing metrics for ${name}.`;
    }
    if (isDoctorRole(viewerRole)) {
      return "Showing metrics for your practice.";
    }
    return undefined;
  }, [query, viewerRole, adminDoctors]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  const loading = !isMounted || isLoading || (isFetching && !data);

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Analytics" description="Appointment insights and trends" />
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load analytics data. Please refresh.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PortalChromeHeader
        icon={TrendingUp}
        title="Business Analytics"
        description={
          scopeHint
            ? `${scopeHint} Track your business performance, patient trends, appointment analytics and more.`
            : "Track your business performance, patient trends, appointment analytics and more."
        }
        actions={
          isDoctorRole(viewerRole) || isAdminRole(viewerRole) ? (
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <InsightsPeriodControls
                period={query.period}
                onPeriodChange={handlePeriodChange}
                disabled={loading && !data}
              />
              <InsightsScopeControls
                filter={query}
                onFilterChange={handleFilterChange}
                viewerRole={viewerRole}
                disabled={loading && !data}
                doctors={adminDoctors}
                doctorsLoading={doctorsLoading}
              />
            </div>
          ) : undefined
        }
      />

      <AnalyticsOverviewStatsRow data={data} valueSkeleton={loading} />

      <AnalyticsInsightsSections
        data={data}
        loading={loading}
        viewerRole={viewerRole}
        organizationWide={query.scope === "organization"}
      />
    </div>
  );
}
