/**
 * useInsights — fetches aggregated appointment insights for the analytics page.
 *
 * Uses InsightsPayload from insights-data.ts as the single source of truth for
 * the data shape — no local duplicate type definition.
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { InsightsPayload } from "@/lib/insights-data";

// Re-export so callers can import the shared payload type from this hook.
export type { InsightsPayload };

export function useInsights() {
  return useQuery({
    queryKey: queryKeys.insights.all,
    queryFn: () => apiClient<InsightsPayload>("/api/insights"),
    staleTime: 5 * 60_000,
  });
}
