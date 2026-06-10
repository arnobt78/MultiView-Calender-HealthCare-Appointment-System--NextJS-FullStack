import { format } from "date-fns";

/** Overview header metric — HH:mm:ss from SSR-stable or query `dataUpdatedAt`. */
export function formatDashboardOverviewLastUpdated(updatedAtMs: number): string {
  return format(new Date(updatedAtMs), "HH:mm:ss");
}

/** Prefer live query timestamp; fall back to SSR prefetch freeze (persist may leave dataUpdatedAt at 0). */
export function resolveDashboardOverviewUpdatedAt(
  queryUpdatedAt: number,
  ssrUpdatedAt?: number
): number {
  if (queryUpdatedAt > 0) return queryUpdatedAt;
  if (ssrUpdatedAt != null && ssrUpdatedAt > 0) return ssrUpdatedAt;
  return 0;
}
