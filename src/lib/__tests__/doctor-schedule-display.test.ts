import { describe, it, expect } from "vitest";
import {
  groupAvailabilityByWeekday,
  minsToTime,
  timeToMins,
  availabilityUsesSingleTimezone,
  formatWeekdayWindowsHint,
  formatWeekdayTimeRangesInline,
  buildServicesAvailabilityDisplayRows,
} from "@/lib/doctor-schedule-display";

describe("doctor-schedule-display", () => {
  it("converts minutes to HH:MM", () => {
    expect(minsToTime(540)).toBe("09:00");
    expect(timeToMins("09:00")).toBe(540);
  });

  it("groups windows by weekday", () => {
    const groups = groupAvailabilityByWeekday([
      { id: "1", weekday: 1, start_min: 540, end_min: 720, timezone: "Europe/Berlin" },
      { id: "2", weekday: 1, start_min: 780, end_min: 1020, timezone: "Europe/Berlin" },
      { id: "3", weekday: 3, start_min: 480, end_min: 960, timezone: "Europe/Berlin" },
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0]?.windows).toHaveLength(2);
  });

  it("detects single timezone", () => {
    expect(
      availabilityUsesSingleTimezone([
        { id: "1", weekday: 0, start_min: 0, end_min: 60, timezone: "UTC" },
        { id: "2", weekday: 1, start_min: 0, end_min: 60, timezone: "UTC" },
      ])
    ).toBe(true);
    expect(
      availabilityUsesSingleTimezone([
        { id: "1", weekday: 0, start_min: 0, end_min: 60, timezone: "UTC" },
        { id: "2", weekday: 1, start_min: 0, end_min: 60, timezone: "Europe/Berlin" },
      ])
    ).toBe(false);
  });

  it("formats weekday hint for collapsed summary", () => {
    expect(
      formatWeekdayWindowsHint([
        { id: "1", weekday: 1, start_min: 600, end_min: 840, timezone: "Europe/Berlin" },
      ])
    ).toBe("1 window · 10:00–14:00");
  });

  it("formats inline weekday ranges for services cards", () => {
    expect(
      formatWeekdayTimeRangesInline([
        { id: "1", weekday: 1, start_min: 600, end_min: 840, timezone: "Europe/Berlin" },
        { id: "2", weekday: 1, start_min: 960, end_min: 1020, timezone: "Europe/Berlin" },
      ])
    ).toBe("10:00 – 14:00, 16:00 – 17:00");
  });

  it("buildServicesAvailabilityDisplayRows merges days with identical hours", () => {
    const rows = buildServicesAvailabilityDisplayRows([
      { weekday: 1, start_min: 540, end_min: 1020 },
      { weekday: 2, start_min: 540, end_min: 1020 },
      { weekday: 3, start_min: 540, end_min: 1020 },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.weekdays).toEqual([1, 2, 3]);
    expect(rows[0]?.ranges).toHaveLength(1);
  });

  it("buildServicesAvailabilityDisplayRows keeps split hours on one weekday inline", () => {
    const rows = buildServicesAvailabilityDisplayRows([
      { weekday: 1, start_min: 600, end_min: 840 },
      { weekday: 1, start_min: 960, end_min: 1020 },
      { weekday: 3, start_min: 480, end_min: 720 },
      { weekday: 3, start_min: 780, end_min: 1020 },
    ]);
    expect(rows).toHaveLength(2);
    const mon = rows.find((r) => r.weekdays.length === 1 && r.weekdays[0] === 1);
    expect(mon?.ranges).toHaveLength(2);
  });
});
