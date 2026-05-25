import { describe, it, expect } from "vitest";
import {
  groupAvailabilityByWeekday,
  minsToTime,
  timeToMins,
  availabilityUsesSingleTimezone,
  formatWeekdayWindowsHint,
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
});
