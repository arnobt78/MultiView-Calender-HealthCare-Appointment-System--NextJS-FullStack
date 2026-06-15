/**
 * Google Events Preview table — loading vs empty vs API-warning states.
 * SSR seeds connected + empty events; client isFetching must show loading, not empty copy.
 */

import type { GoogleCalendarEventsFetchWarning } from "@/types/google-calendar";

export type GoogleCalendarEventsPreviewLoadingInput = {
  isConnected: boolean;
  isFetching: boolean;
  listBodyLoading: boolean;
  eventCount: number;
  eventsFetchWarning: GoogleCalendarEventsFetchWarning | null;
};

/** True when preview table should show spinner (not disconnected/empty messages). */
export function isGoogleCalendarEventsPreviewLoading(
  input: GoogleCalendarEventsPreviewLoadingInput
): boolean {
  if (input.listBodyLoading) return true;
  if (input.eventsFetchWarning) return false;
  return input.isConnected && input.isFetching && input.eventCount === 0;
}
