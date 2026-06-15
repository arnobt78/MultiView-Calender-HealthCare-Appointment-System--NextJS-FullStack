/**
 * Google Events Preview table — loading vs empty vs API-warning states.
 * SSR seeds connected + empty events; client isFetching must show loading, not empty copy.
 */

import type { GoogleCalendarEventsFetchWarning } from "@/types/google-calendar";

export type GoogleCalendarEventsPreviewLoadingInput = {
  isConnected: boolean;
  isFetching: boolean;
  /** TanStack fetchStatus — covers first mount before isFetching flips. */
  isStatusPending?: boolean;
  isLoading?: boolean;
  listBodyLoading: boolean;
  eventCount: number;
  eventsFetchWarning: GoogleCalendarEventsFetchWarning | null;
  /** OAuth backfill + invalidate in flight (before isFetching flips). */
  oauthConnectPhase?: boolean;
};

/** True when preview table should show spinner (not disconnected/empty messages). */
export function isGoogleCalendarEventsPreviewLoading(
  input: GoogleCalendarEventsPreviewLoadingInput
): boolean {
  if (input.listBodyLoading) return true;
  if (input.eventsFetchWarning) return false;
  if (!input.isConnected) return false;
  if (input.eventCount > 0) return false;
  if (input.oauthConnectPhase) return true;
  return (
    input.isFetching ||
    input.isLoading === true ||
    input.isStatusPending === true
  );
}
