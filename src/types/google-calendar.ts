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

export interface GoogleCalendarStatus {
  connected: boolean;
  events?: GoogleCalendarEvent[];
}
