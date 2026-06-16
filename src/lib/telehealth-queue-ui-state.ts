/**
 * Telehealth queue date-tab state — URL search param `filter` (SSR-safe, no hydration mismatch).
 * Valid values: today | upcoming | all (default: today when param absent).
 */

import type { TelehealthQueueDateFilter } from "@/lib/telehealth-queue-filter";

/** Query key on `/telehealth-queue` and `/control-panel/telehealth-queue`. */
export const TELEHEALTH_QUEUE_FILTER_PARAM = "filter";

const VALID_FILTERS: TelehealthQueueDateFilter[] = ["today", "upcoming", "all"];

/** Parse `?filter=` from URL — shared by server + client so hydrate matches. */
export function parseTelehealthQueueDateFilter(
  raw: string | null | undefined
): TelehealthQueueDateFilter {
  if (raw && VALID_FILTERS.includes(raw as TelehealthQueueDateFilter)) {
    return raw as TelehealthQueueDateFilter;
  }
  return "today";
}

/** Build next URL search string when user picks a tab pill. */
export function buildTelehealthQueueFilterSearchParams(
  current: URLSearchParams,
  filter: TelehealthQueueDateFilter
): string {
  const params = new URLSearchParams(current.toString());
  if (filter === "today") {
    params.delete(TELEHEALTH_QUEUE_FILTER_PARAM);
  } else {
    params.set(TELEHEALTH_QUEUE_FILTER_PARAM, filter);
  }
  return params.toString();
}
