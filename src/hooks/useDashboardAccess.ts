/**
 * useDashboardAccess — fetches the current user's dashboard sharing records.
 *
 * Uses the richer DashboardAccessRow type from query-fetchers so both the
 * hook and the ensureQueryData call in useAppointments share the same shape.
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { type DashboardAccessRow, fetchDashboardAccessAll } from "@/lib/query-fetchers";

// Re-export so callers can import the type from this hook without knowing about query-fetchers.
export type { DashboardAccessRow };

export function useDashboardAccess() {
  return useQuery({
    queryKey: queryKeys.dashboardAccess.all,
    queryFn: () => fetchDashboardAccessAll(),
    staleTime: 5 * 60 * 1000,
  });
}
