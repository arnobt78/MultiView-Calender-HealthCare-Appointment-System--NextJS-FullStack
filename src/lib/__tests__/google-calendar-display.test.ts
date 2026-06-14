import { describe, expect, it } from "vitest";
import {
  countUpcomingGoogleCalendarEvents,
  filterGoogleCalendarEvents,
  formatGoogleCalendarEventDurationLabel,
  formatGoogleCalendarEventStart,
  formatGoogleCalendarEventWhenRange,
  getGoogleCalendarEventDescriptionPreview,
  getGoogleCalendarEventSearchBlob,
  isGoogleCalendarEventAllDay,
  sortGoogleCalendarEventsByStart,
} from "@/lib/google-calendar-display";
import type { GoogleCalendarEvent } from "@/types/google-calendar";

describe("google-calendar-display", () => {
  it("formats datetime start", () => {
    expect(
      formatGoogleCalendarEventStart({
        summary: "Test",
        start: { dateTime: "2026-06-15T10:30:00.000Z" },
      })
    ).toMatch(/2026-06-15/);
  });

  it("sorts events by start ascending", () => {
    const sorted = sortGoogleCalendarEventsByStart([
      { summary: "B", start: { dateTime: "2026-06-16T10:00:00.000Z" } },
      { summary: "A", start: { dateTime: "2026-06-14T10:00:00.000Z" } },
    ]);
    expect(sorted[0]?.summary).toBe("A");
  });

  it("counts upcoming events within 7 days", () => {
    const now = new Date("2026-06-14T12:00:00.000Z");
    const events: GoogleCalendarEvent[] = [
      { summary: "Soon", start: { dateTime: "2026-06-15T10:00:00.000Z" } },
      { summary: "Later", start: { dateTime: "2026-07-01T10:00:00.000Z" } },
    ];
    expect(countUpcomingGoogleCalendarEvents(events, now)).toBe(1);
  });

  it("detects all-day events", () => {
    expect(
      isGoogleCalendarEventAllDay({ start: { date: "2026-06-15" } })
    ).toBe(true);
    expect(
      isGoogleCalendarEventAllDay({ start: { dateTime: "2026-06-15T10:00:00.000Z" } })
    ).toBe(false);
  });

  it("filters events by window, schedule, and location", () => {
    const now = new Date("2026-06-14T12:00:00.000Z");
    const events: GoogleCalendarEvent[] = [
      {
        summary: "Timed upcoming",
        start: { dateTime: "2026-06-15T10:00:00.000Z" },
        location: "Clinic A",
      },
      {
        summary: "All day",
        start: { date: "2026-06-20" },
      },
      {
        summary: "Past",
        start: { dateTime: "2026-06-01T10:00:00.000Z" },
        location: "Clinic B",
      },
    ];

    expect(
      filterGoogleCalendarEvents(
        events,
        { window: "past", schedule: "all", location: "all", search: "" },
        now
      )
    ).toHaveLength(1);

    expect(
      filterGoogleCalendarEvents(
        events,
        { window: "all", schedule: "all_day", location: "all", search: "" },
        now
      )
    ).toHaveLength(1);

    expect(
      filterGoogleCalendarEvents(
        events,
        { window: "all", schedule: "all", location: "with_location", search: "" },
        now
      )
    ).toHaveLength(2);
  });

  it("formats merged when range for timed and all-day events", () => {
    const timed = formatGoogleCalendarEventWhenRange({
      summary: "Visit",
      start: { dateTime: "2026-06-15T10:00:00.000Z" },
      end: { dateTime: "2026-06-15T10:45:00.000Z" },
    });
    expect(timed).toMatch(/Jun 2026/);
    expect(timed).toMatch(/\(45 min\)/);

    const allDay = formatGoogleCalendarEventWhenRange({
      summary: "Holiday",
      start: { date: "2026-06-20" },
      end: { date: "2026-06-21" },
    });
    expect(allDay).toMatch(/20 Jun 2026/);

    const multiDay = formatGoogleCalendarEventWhenRange({
      summary: "Trip",
      start: { date: "2026-06-20" },
      end: { date: "2026-06-23" },
    });
    expect(multiDay).toContain("–");
  });

  it("formats duration labels", () => {
    expect(
      formatGoogleCalendarEventDurationLabel({
        start: { date: "2026-06-15" },
      })
    ).toBe("All day");
    expect(
      formatGoogleCalendarEventDurationLabel({
        start: { dateTime: "2026-06-15T10:00:00.000Z" },
        end: { dateTime: "2026-06-15T10:45:00.000Z" },
      })
    ).toBe("45 min");
  });

  it("search blob includes description and when range", () => {
    const blob = getGoogleCalendarEventSearchBlob({
      summary: "Team sync",
      description: "Quarterly planning",
      location: "Room A",
      start: { dateTime: "2026-06-15T10:00:00.000Z" },
      end: { dateTime: "2026-06-15T11:00:00.000Z" },
      status: "confirmed",
    });
    expect(blob).toContain("quarterly planning");
    expect(blob).toContain("confirmed");
  });

  it("strips HTML from description preview", () => {
    expect(
      getGoogleCalendarEventDescriptionPreview({
        description: "<p>Hello <b>world</b></p>",
      })
    ).toBe("Hello world");
  });
});
