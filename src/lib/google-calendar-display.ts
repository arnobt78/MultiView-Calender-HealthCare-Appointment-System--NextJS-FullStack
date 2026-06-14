/**
 * Google Calendar CP — event formatting, metrics, and client-side toolbar filters.
 */

import { format, isWithinInterval, addDays, startOfDay, differenceInMinutes } from "date-fns";
import type { GoogleCalendarEvent } from "@/types/google-calendar";
import type {
  GoogleCalendarEventLocationFilter,
  GoogleCalendarEventScheduleFilter,
  GoogleCalendarEventWindowFilter,
} from "@/lib/google-calendar-event-filters";

export function parseGoogleCalendarEventInstant(
  point?: { dateTime?: string; date?: string }
): Date | null {
  const raw = point?.dateTime ?? point?.date;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatGoogleCalendarEventStart(event: GoogleCalendarEvent): string {
  const start = parseGoogleCalendarEventInstant(event.start);
  if (!start) return "—";
  const allDay = Boolean(event.start?.date && !event.start?.dateTime);
  return allDay ? format(start, "yyyy-MM-dd") : format(start, "yyyy-MM-dd HH:mm");
}

export function getGoogleCalendarEventSearchBlob(event: GoogleCalendarEvent): string {
  return [
    event.summary,
    event.description,
    event.location,
    formatGoogleCalendarEventStart(event),
    formatGoogleCalendarEventWhenRange(event),
    getGoogleCalendarEventScheduleLabel(event),
    event.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/** Human label for schedule filter parity — All-day vs Timed. */
export function getGoogleCalendarEventScheduleLabel(event: GoogleCalendarEvent): "All-day" | "Timed" {
  return isGoogleCalendarEventAllDay(event) ? "All-day" : "Timed";
}

/** Duration hint for When column — timed minutes or All day. */
export function formatGoogleCalendarEventDurationLabel(event: GoogleCalendarEvent): string {
  if (isGoogleCalendarEventAllDay(event)) return "All day";
  const start = parseGoogleCalendarEventInstant(event.start);
  const end = parseGoogleCalendarEventInstant(event.end);
  if (!start || !end) return "—";
  const minutes = differenceInMinutes(end, start);
  if (minutes <= 0) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours} hr ${rem} min` : `${hours} hr`;
}

/**
 * Merged start–end label — mirrors appointment When cell (CP list parity).
 * Timed: `dd MMM yyyy, HH:mm – HH:mm`; all-day: single or inclusive multi-day range.
 */
export function formatGoogleCalendarEventWhenRange(event: GoogleCalendarEvent): string {
  const allDay = isGoogleCalendarEventAllDay(event);
  const start = parseGoogleCalendarEventInstant(event.start);
  if (!start) return "—";

  if (allDay) {
    const endExclusive = parseGoogleCalendarEventInstant(event.end);
    if (!endExclusive) return format(start, "dd MMM yyyy");
    const endInclusive = addDays(endExclusive, -1);
    if (endInclusive.getTime() <= start.getTime()) {
      return format(start, "dd MMM yyyy");
    }
    return `${format(start, "dd MMM yyyy")} – ${format(endInclusive, "dd MMM yyyy")}`;
  }

  const end = parseGoogleCalendarEventInstant(event.end);
  if (!end) return format(start, "dd MMM yyyy, HH:mm");

  const sameDay = format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd");
  const range = sameDay
    ? `${format(start, "dd MMM yyyy, HH:mm")} – ${format(end, "HH:mm")}`
    : `${format(start, "dd MMM yyyy, HH:mm")} – ${format(end, "dd MMM yyyy, HH:mm")}`;

  const duration = formatGoogleCalendarEventDurationLabel(event);
  if (duration !== "—") {
    return `${range} (${duration})`;
  }
  return range;
}

/** Plain-text event title for tables and search. */
export function getGoogleCalendarEventTitle(event: GoogleCalendarEvent): string {
  return event.summary?.trim() || "Untitled event";
}

/** Strip HTML / excessive whitespace from Google event descriptions. */
export function getGoogleCalendarEventDescriptionPreview(
  event: GoogleCalendarEvent,
  maxLength = 120
): string | null {
  const raw = event.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!raw) return null;
  if (raw.length <= maxLength) return raw;
  return `${raw.slice(0, maxLength).trim()}…`;
}

/** Events starting within the next 7 days (inclusive). */
export function countUpcomingGoogleCalendarEvents(
  events: GoogleCalendarEvent[],
  now = new Date()
): number {
  const windowEnd = addDays(now, 7);
  return events.filter((event) => {
    const start = parseGoogleCalendarEventInstant(event.start);
    if (!start) return false;
    return isWithinInterval(start, { start: now, end: windowEnd });
  }).length;
}

export function sortGoogleCalendarEventsByStart(
  events: GoogleCalendarEvent[]
): GoogleCalendarEvent[] {
  return [...events].sort((a, b) => {
    const aStart = parseGoogleCalendarEventInstant(a.start)?.getTime() ?? 0;
    const bStart = parseGoogleCalendarEventInstant(b.start)?.getTime() ?? 0;
    return aStart - bStart;
  });
}

/** True when Google returns an all-day `date` without `dateTime`. */
export function isGoogleCalendarEventAllDay(event: GoogleCalendarEvent): boolean {
  return Boolean(event.start?.date && !event.start?.dateTime);
}

function matchesGoogleCalendarEventWindow(
  event: GoogleCalendarEvent,
  window: GoogleCalendarEventWindowFilter,
  now = new Date()
): boolean {
  if (window === "all") return true;
  const start = parseGoogleCalendarEventInstant(event.start);
  if (!start) return false;
  const startMs = start.getTime();
  const nowMs = now.getTime();
  if (window === "upcoming") return startMs >= startOfDay(now).getTime();
  if (window === "past") return startMs < nowMs;
  if (window === "next7") {
    const windowEnd = addDays(now, 7);
    return isWithinInterval(start, { start: now, end: windowEnd });
  }
  return true;
}

function matchesGoogleCalendarEventSchedule(
  event: GoogleCalendarEvent,
  schedule: GoogleCalendarEventScheduleFilter
): boolean {
  if (schedule === "all") return true;
  const allDay = isGoogleCalendarEventAllDay(event);
  if (schedule === "all_day") return allDay;
  return !allDay;
}

function matchesGoogleCalendarEventLocation(
  event: GoogleCalendarEvent,
  location: GoogleCalendarEventLocationFilter
): boolean {
  if (location === "all") return true;
  const hasLocation = Boolean(event.location?.trim());
  if (location === "with_location") return hasLocation;
  return !hasLocation;
}

/** Applies toolbar filters + search on the cached Google events list (no refetch). */
export function filterGoogleCalendarEvents(
  events: GoogleCalendarEvent[],
  filters: {
    window: GoogleCalendarEventWindowFilter;
    schedule: GoogleCalendarEventScheduleFilter;
    location: GoogleCalendarEventLocationFilter;
    search: string;
  },
  now = new Date()
): GoogleCalendarEvent[] {
  const query = filters.search.trim().toLowerCase();
  return sortGoogleCalendarEventsByStart(events).filter((event) => {
    if (!matchesGoogleCalendarEventWindow(event, filters.window, now)) return false;
    if (!matchesGoogleCalendarEventSchedule(event, filters.schedule)) return false;
    if (!matchesGoogleCalendarEventLocation(event, filters.location)) return false;
    if (query && !getGoogleCalendarEventSearchBlob(event).includes(query)) return false;
    return true;
  });
}
