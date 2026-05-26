/**
 * @deprecated Prefer useInsights with InsightsQueryKey — stored under analytics.all for legacy caches.
 * useAnalytics — legacy alias for the insights endpoint, stored under analytics.all.
 *
 * Uses InsightsPayload from insights-data.ts (same shape as /api/analytics response)
 * so both insights and analytics views share one canonical type definition.
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { InsightsPayload } from "@/lib/insights-data";

export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics.all,
    queryFn: () => apiClient<InsightsPayload>("/api/analytics"),
    staleTime: 5 * 60_000,
  });
}
