/**
 * Google Calendar CP — KPI / refresh chrome vs silent background refetch.
 * Stats and manual refresh buttons must not pulse on OAuth/invalidate background fetch.
 */

/** Cold load only — SSR/cache not seeded yet. */
export function isGoogleCalendarStatsSkeleton(listBodyLoading: boolean): boolean {
  return listBodyLoading;
}

/** User clicked Refresh — not OAuth/invalidate background refetch. */
export function isGoogleCalendarManualRefreshUi(manualRefreshPending: boolean): boolean {
  return manualRefreshPending;
}
