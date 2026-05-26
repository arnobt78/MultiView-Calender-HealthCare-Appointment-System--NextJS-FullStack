/**
 * useInsights — scoped + period-aware analytics for /insights (AnalyticsPage).
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { InsightsPayload } from "@/lib/insights-data";
import { buildInsightsQueryString, type InsightsQueryKey } from "@/lib/insights-scope";

export type { InsightsPayload };

export function useInsights(query: InsightsQueryKey) {
  return useQuery({
    queryKey: queryKeys.insights.filter(query),
    queryFn: () =>
      apiClient<InsightsPayload>(`/api/insights?${buildInsightsQueryString(query)}`),
    staleTime: 3 * 60_000,
    placeholderData: (previous) => previous,
  });
}
