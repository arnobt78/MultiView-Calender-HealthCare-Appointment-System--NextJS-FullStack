import { describe, expect, it, vi, beforeEach } from "vitest";
import { trendBucketCount } from "@/lib/insights/insights-period";

const mockAppointmentCount = vi.hoisted(() => vi.fn().mockResolvedValue(1));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: {
      count: mockAppointmentCount,
    },
  },
}));

import { fetchTrendCountsByPeriod } from "@/lib/insights/insights-aggregate";

describe("trendBucketCount", () => {
  it("all uses fixed placeholder cap", () => {
    expect(trendBucketCount("all")).toBe(12);
  });

  const may2026 = new Date("2026-05-26T12:00:00Z");

  it("month uses days in calendar month", () => {
    expect(trendBucketCount("month", may2026)).toBe(31);
  });

  it("year uses twelve calendar months", () => {
    expect(trendBucketCount("year", may2026)).toBe(12);
  });
});

describe("fetchTrendCountsByPeriod", () => {
  const now = new Date("2026-05-26T12:00:00Z");

  beforeEach(() => {
    mockAppointmentCount.mockClear();
    mockAppointmentCount.mockResolvedValue(1);
  });

  it("month and year return different bucket counts and labels", async () => {
    const monthTrend = await fetchTrendCountsByPeriod({}, "month", now);
    const yearTrend = await fetchTrendCountsByPeriod({}, "year", now);

    expect(monthTrend).toHaveLength(31);
    expect(yearTrend).toHaveLength(12);
    expect(monthTrend[0]?.label).toMatch(/May/);
    expect(yearTrend[0]?.label).toBe("Jan");
    expect(yearTrend[11]?.label).toBe("Dec");
    expect(mockAppointmentCount).toHaveBeenCalledTimes(31 + 12);
  });
});
