/** Google Calendar API event shape returned by GET /api/calendar/sync. */
export type GoogleCalendarEventStatus = "confirmed" | "tentative" | "cancelled" | (string & {});

export interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  status?: GoogleCalendarEventStatus;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  location?: string;
  htmlLink?: string;
  [key: string]: unknown;
}

/** Stable codes when connected but Google list/push API fails. */
export type GoogleCalendarEventsFetchWarningCode =
  | "SERVICE_DISABLED"
  | "PERMISSION_DENIED"
  | "RATE_LIMIT"
  | "UNKNOWN";

export interface GoogleCalendarEventsFetchWarning {
  code: GoogleCalendarEventsFetchWarningCode;
  message: string;
  /** GCP Console link when Calendar API is disabled. */
  activationUrl?: string;
}

/** Result of POST /api/calendar/backfill after OAuth connect. */
export interface GoogleCalendarBackfillSummary {
  attempted: number;
  synced: number;
  skipped: number;
  failed: number;
}

export interface GoogleCalendarStatus {
  connected: boolean;
  events?: GoogleCalendarEvent[];
  /** Set when token exists but list-events failed — UI shows banner, stays connected. */
  eventsFetchWarning?: GoogleCalendarEventsFetchWarning | null;
}
