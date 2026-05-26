import { describe, expect, it, vi, beforeEach } from "vitest";

const mockAppointmentCount = vi.hoisted(() => vi.fn().mockResolvedValue(0));
const mockAppointmentFindMany = vi.hoisted(() => vi.fn().mockResolvedValue([]));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: {
      count: mockAppointmentCount,
      findMany: mockAppointmentFindMany,
    },
  },
}));

import {
  fetchBusiestDayOfWeekCounts,
  fetchStatusOverTimeByPeriod,
} from "@/lib/insights/insights-aggregate";

describe("fetchStatusOverTimeByPeriod", () => {
  const now = new Date("2026-05-26T12:00:00Z");

  beforeEach(() => {
    mockAppointmentCount.mockClear();
    mockAppointmentCount.mockResolvedValue(1);
  });

  it("day uses 24 hourly buckets", async () => {
    const rows = await fetchStatusOverTimeByPeriod({}, "day", now);
    expect(rows).toHaveLength(24);
    expect(rows[0]?.month).toBe("0:00");
  });

  it("week uses 7 weekday buckets", async () => {
    const rows = await fetchStatusOverTimeByPeriod({}, "week", now);
    expect(rows).toHaveLength(7);
    expect(rows[0]?.month).toBe("Sun");
  });

  it("month uses daily buckets in calendar month", async () => {
    const rows = await fetchStatusOverTimeByPeriod({}, "month", now);
    expect(rows).toHaveLength(31);
  });

  it("year uses twelve monthly buckets", async () => {
    const rows = await fetchStatusOverTimeByPeriod({}, "year", now);
    expect(rows).toHaveLength(12);
    expect(rows[0]?.month).toMatch(/Jan/);
  });
});

describe("fetchBusiestDayOfWeekCounts", () => {
  const rangeStart = new Date("2026-05-01T00:00:00Z");
  const rangeEnd = new Date("2026-05-31T23:59:59.999Z");

  beforeEach(() => {
    mockAppointmentFindMany.mockClear();
    mockAppointmentFindMany.mockResolvedValue([
      { start: new Date("2026-05-05T10:00:00Z") },
      { start: new Date("2026-05-05T14:00:00Z") },
      { start: new Date("2026-05-06T09:00:00Z") },
    ]);
  });

  it("scopes findMany to period range and returns seven weekdays", async () => {
    const rows = await fetchBusiestDayOfWeekCounts({}, rangeStart, rangeEnd);
    expect(rows).toHaveLength(7);
    expect(mockAppointmentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          start: { gte: rangeStart, lte: rangeEnd },
        }),
      })
    );
  });
});
