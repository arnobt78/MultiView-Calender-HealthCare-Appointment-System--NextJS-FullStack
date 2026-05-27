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
import { InsightsScopeToolbar } from "@/components/insights";
import {
  buildInsightsQueryString,
  defaultInsightsQueryForRole,
  type InsightsFilterKey,
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
import { resolveInsightsScopePageHint } from "@/lib/insights-scope-display";
import { insightsScopeBodyClass, insightsScopeHintClass } from "@/lib/insights-ui-classes";

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
    (nextFilter: InsightsFilterKey) => {
      const next: InsightsQueryKey = {
        period: query.period,
        scope: nextFilter.scope,
        doctorId:
          nextFilter.scope === "personal" ? nextFilter.doctorId : undefined,
      };
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

  const selectedDoctor = useMemo(
    () => adminDoctors.find((u) => u.id === query.doctorId),
    [adminDoctors, query.doctorId]
  );

  const doctorDisplayName = useMemo(
    () =>
      selectedDoctor?.display_name?.trim() ||
      selectedDoctor?.email?.trim() ||
      undefined,
    [selectedDoctor]
  );

  const scopeHint = useMemo(
    () =>
      resolveInsightsScopePageHint({
        scope: query.scope,
        viewerRole,
        doctorId: query.doctorId,
        doctorDisplayName,
      }),
    [query.scope, query.doctorId, viewerRole, doctorDisplayName]
  );

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
          scopeHint ? (
            <>
              <span className={insightsScopeHintClass}>{scopeHint}</span>{" "}
              <span className={insightsScopeBodyClass}>
                Track your business performance, patient trends, appointment analytics and
                more.
              </span>
            </>
          ) : (
            <span className={insightsScopeBodyClass}>
              Track your business performance, patient trends, appointment analytics and more.
            </span>
          )
        }
        actions={
          isDoctorRole(viewerRole) || isAdminRole(viewerRole) ? (
            <InsightsScopeToolbar
              filter={query}
              onFilterChange={handleFilterChange}
              viewerRole={viewerRole}
              disabled={loading && !data}
              doctors={adminDoctors}
              doctorsLoading={doctorsLoading}
            />
          ) : undefined
        }
      />

      <AnalyticsOverviewStatsRow data={data} valueSkeleton={loading} />

      <AnalyticsInsightsSections
        data={data}
        loading={loading}
        viewerRole={viewerRole}
        insightsQuery={query}
        doctorDisplayName={doctorDisplayName}
        period={query.period}
        onPeriodChange={handlePeriodChange}
        periodControlsDisabled={loading && !data}
      />
    </div>
  );
}
