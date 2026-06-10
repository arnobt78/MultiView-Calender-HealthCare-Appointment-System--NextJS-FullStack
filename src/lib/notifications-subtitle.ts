import {
  formatDashboardOverviewLastUpdated,
  resolveDashboardOverviewUpdatedAt,
} from "@/lib/dashboard-overview-subtitle";

/** Notifications header metric — HH:mm:ss from SSR-stable or query `dataUpdatedAt`. */
export function formatNotificationsSubtitleUpdatedAt(updatedAtMs: number): string {
  return formatDashboardOverviewLastUpdated(updatedAtMs);
}

/** Prefer live query timestamp; fall back to SSR prefetch freeze (persist may leave dataUpdatedAt at 0). */
export function resolveNotificationsSubtitleUpdatedAt(
  queryUpdatedAt: number,
  ssrUpdatedAt?: number
): number {
  return resolveDashboardOverviewUpdatedAt(queryUpdatedAt, ssrUpdatedAt);
}

/** Prefer live query total; fall back to SSR prefetch when cache has no row yet. */
export function resolveNotificationsSubtitleTotal(
  queryTotal: number,
  hasQueryData: boolean,
  ssrPrefetch?: { total: number } | null
): number | null {
  if (hasQueryData) return queryTotal;
  if (ssrPrefetch != null) return ssrPrefetch.total;
  return null;
}

/** Trailing count after time metric — e.g. " · 12 total". */
export function buildNotificationsSubtitleTotalSuffix(total: number | null): string {
  if (total === null) return "";
  return ` · ${total} total`;
}
