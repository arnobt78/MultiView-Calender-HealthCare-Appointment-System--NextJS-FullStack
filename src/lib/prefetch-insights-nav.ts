/**
 * Navbar hover prefetch for /insights — warms default scope + month period before navigation.
 */

import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { InsightsPayload } from "@/lib/insights-data";
import {
  buildInsightsQueryString,
  defaultInsightsQueryForRole,
  type InsightsQueryKey,
} from "@/lib/insights-scope";

export function prefetchInsightsNav(
  queryClient: QueryClient,
  opts: { role: string | null | undefined }
): void {
  const filter: InsightsQueryKey = defaultInsightsQueryForRole(opts.role);
  const qs = buildInsightsQueryString(filter);
  void queryClient.prefetchQuery({
    queryKey: queryKeys.insights.filter(filter),
    queryFn: () => apiClient<InsightsPayload>(`/api/insights?${qs}`),
    staleTime: 3 * 60_000,
  });
}
