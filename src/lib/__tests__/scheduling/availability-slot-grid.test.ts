import { describe, expect, it } from "vitest";
import { flexibleSchedulingTypeConfig } from "@/lib/scheduling/flexible-type-config";
import {
  buildDaySlotCells,
  buildMonthDayEntries,
  getJsWeekdayInTimezone,
  monthDayStatusFromCells,
} from "@/lib/scheduling/availability-slot-grid";
import type { DaySchedulingContext, SchedulingTypeConfig } from "@/lib/scheduling/scheduling-types";

const TYPE_45_30: SchedulingTypeConfig = {
  duration_minutes: 45,
  buffer_before_minutes: 5,
  buffer_after_minutes: 5,
  slot_interval_minutes: 30,
  minimum_notice_minutes: 0,
};

const MON_FRI_UTC = [
  { weekday: 1, start_min: 9 * 60, end_min: 17 * 60, timezone: "UTC" },
  { weekday: 2, start_min: 9 * 60, end_min: 17 * 60, timezone: "UTC" },
  { weekday: 3, start_min: 9 * 60, end_min: 17 * 60, timezone: "UTC" },
  { weekday: 4, start_min: 9 * 60, end_min: 17 * 60, timezone: "UTC" },
  { weekday: 5, start_min: 9 * 60, end_min: 17 * 60, timezone: "UTC" },
];

function baseCtx(overrides: Partial<DaySchedulingContext>): DaySchedulingContext {
  return {
    dateStr: "2026-05-25",
    type: TYPE_45_30,
    availabilityRows: MON_FRI_UTC,
    busyIntervals: [],
    timeOffIntervals: [],
    now: new Date("2026-05-20T08:00:00.000Z"),
    ...overrides,
  };
}

describe("getJsWeekdayInTimezone", () => {
  it("returns Monday (1) for 2026-05-25 in UTC", () => {
    expect(getJsWeekdayInTimezone("2026-05-25", "UTC")).toBe(1);
  });
});

describe("buildDaySlotCells", () => {
  it("returns available slots on a Monday within weekly hours", () => {
    const { cells, timezone } = buildDaySlotCells(baseCtx({}));
    expect(timezone).toBe("UTC");
    const available = cells.filter((c) => c.status === "available");
    expect(available.length).toBeGreaterThan(0);
    expect(available[0]?.start).toMatch(/2026-05-25T09:00:00/);
  });

  it("marks overlapping appointment as booked and omits from legacy-available filter", () => {
    const bookedStart = new Date("2026-05-25T09:00:00.000Z");
    const bookedEnd = new Date("2026-05-25T09:45:00.000Z");
    const { cells } = buildDaySlotCells(
      baseCtx({
        busyIntervals: [
          { start: bookedStart, end: bookedEnd, appointmentId: "appt-1" },
        ],
      })
    );
    const nine = cells.find((c) => c.start.startsWith("2026-05-25T09:00:00"));
    expect(nine?.status).toBe("booked");
    const legacySlots = cells.filter((c) => c.status === "available").map((c) => c.start);
    expect(legacySlots.some((s) => s.startsWith("2026-05-25T09:00:00"))).toBe(false);
  });

  it("excludeAppointmentId frees the excluded busy interval", () => {
    const bookedStart = new Date("2026-05-25T09:00:00.000Z");
    const bookedEnd = new Date("2026-05-25T09:45:00.000Z");
    const { cells } = buildDaySlotCells(
      baseCtx({
        busyIntervals: [
          { start: bookedStart, end: bookedEnd, appointmentId: "appt-edit" },
        ],
        excludeAppointmentId: "appt-edit",
      })
    );
    const nine = cells.find((c) => c.start.startsWith("2026-05-25T09:00:00"));
    expect(nine?.status).toBe("available");
  });

  it("returns no cells for Sunday (no availability row)", () => {
    const { cells } = buildDaySlotCells(baseCtx({ dateStr: "2026-05-24" }));
    expect(cells).toHaveLength(0);
  });

  it("marks slots before minimum notice as past", () => {
    const { cells } = buildDaySlotCells(
      baseCtx({
        dateStr: "2026-05-20",
        type: { ...TYPE_45_30, minimum_notice_minutes: 60 },
        now: new Date("2026-05-20T14:00:00.000Z"),
      })
    );
    const morning = cells.find((c) => c.start.startsWith("2026-05-20T09:00:00"));
    expect(morning?.status).toBe("past");
    expect(cells.some((c) => c.status === "available")).toBe(true);
  });

  it("marks time-off overlap as blocked", () => {
    const { cells } = buildDaySlotCells(
      baseCtx({
        timeOffIntervals: [
          {
            start: new Date("2026-05-25T10:00:00.000Z"),
            end: new Date("2026-05-25T11:00:00.000Z"),
          },
        ],
      })
    );
    const ten = cells.find((c) => c.start.startsWith("2026-05-25T10:00:00"));
    expect(ten?.status).toBe("blocked");
  });
});

describe("monthDayStatusFromCells", () => {
  it("classifies open, full, and unavailable", () => {
    expect(monthDayStatusFromCells([])).toBe("unavailable");
    expect(
      monthDayStatusFromCells([
        { start: "2026-05-25T09:00:00.000Z", status: "booked" },
        { start: "2026-05-25T09:30:00.000Z", status: "available" },
      ])
    ).toBe("open");
    expect(
      monthDayStatusFromCells([
        { start: "2026-05-25T09:00:00.000Z", status: "booked" },
        { start: "2026-05-25T09:30:00.000Z", status: "past" },
      ])
    ).toBe("full");
  });
});

describe("buildMonthDayEntries — flexible synthetic type", () => {
  it("marks weekdays open with 30min flex config", () => {
    const flexType = flexibleSchedulingTypeConfig(30);
    const busyByDate = new Map<string, { start: Date; end: Date }[]>();
    const { days } = buildMonthDayEntries(
      "2026-05",
      MON_FRI_UTC,
      flexType,
      busyByDate,
      [],
      { now: new Date("2026-05-01T08:00:00.000Z") }
    );
    const mon = days.find((d) => d.date === "2026-05-25");
    expect(mon?.status).toBe("open");
  });
});

describe("buildMonthDayEntries", () => {
  it("marks Monday open and Sunday unavailable in month map", () => {
    const busyByDate = new Map<string, { start: Date; end: Date }[]>();
    const { days, timezone } = buildMonthDayEntries(
      "2026-05",
      MON_FRI_UTC,
      TYPE_45_30,
      busyByDate,
      [],
      { now: new Date("2026-05-01T08:00:00.000Z") }
    );
    expect(timezone).toBe("UTC");
    const mon = days.find((d) => d.date === "2026-05-25");
    const sun = days.find((d) => d.date === "2026-05-24");
    expect(mon?.status).toBe("open");
    expect(sun?.status).toBe("unavailable");
  });
});
