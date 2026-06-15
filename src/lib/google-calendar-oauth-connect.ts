/**
 * One-shot guard for OAuth ?gcal=connected — prevents backfill/sync storm from
 * unstable useEffect deps (mutateAsync/refetch) and React Strict Mode double mount.
 */

export const GCAL_OAUTH_BACKFILL_DONE_KEY = "healthcal_gcal_oauth_backfill_done";

/** Call on disconnect so a later reconnect can backfill again. */
export function clearGoogleCalendarOAuthBackfillGuard(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(GCAL_OAUTH_BACKFILL_DONE_KEY);
  } catch {
    // Private mode — ignore.
  }
}

/**
 * True once per browser session when landing with ?gcal=connected.
 * Sets sessionStorage before returning true so concurrent effect runs skip.
 */
export function shouldRunGoogleCalendarOAuthBackfill(
  gcalParam: string | null
): boolean {
  if (gcalParam !== "connected") return false;
  if (typeof sessionStorage === "undefined") return false;
  try {
    if (sessionStorage.getItem(GCAL_OAUTH_BACKFILL_DONE_KEY) === "1") {
      return false;
    }
    sessionStorage.setItem(GCAL_OAUTH_BACKFILL_DONE_KEY, "1");
    return true;
  } catch {
    return true;
  }
}
