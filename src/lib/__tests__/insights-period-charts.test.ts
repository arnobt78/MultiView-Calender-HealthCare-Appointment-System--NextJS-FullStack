import { describe, expect, it, vi, beforeEach } from "vitest";

const mockAppointmentCount = vi.hoisted(() => vi.fn().mockResolvedValue(0));
const mockQueryRaw = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockInvoiceGroupBy = vi.hoisted(() => vi.fn().mockResolvedValue([]));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: {
      count: mockAppointmentCount,
    },
    invoice: {
      groupBy: mockInvoiceGroupBy,
      aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 0 } }),
    },
    $queryRaw: mockQueryRaw,
  },
}));

import {
  fetchBusiestDayOfWeekCounts,
  fetchRevenueAggregates,
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
    mockQueryRaw.mockClear();
    mockQueryRaw.mockResolvedValue([
      { dow: 1, count: BigInt(2) },
      { dow: 2, count: BigInt(1) },
    ]);
  });

  it("uses SQL group-by and returns seven weekdays", async () => {
    const rows = await fetchBusiestDayOfWeekCounts({}, rangeStart, rangeEnd);
    expect(rows).toHaveLength(7);
    expect(mockQueryRaw).toHaveBeenCalledTimes(1);
    expect(rows[1]?.count).toBe(2);
    expect(rows[2]?.count).toBe(1);
  });
});

describe("fetchRevenueAggregates", () => {
  const now = new Date("2026-05-26T12:00:00Z");

  beforeEach(() => {
    mockInvoiceGroupBy.mockClear();
    mockInvoiceGroupBy.mockResolvedValue([{ status: "paid", _count: { _all: 3 } }]);
  });

  it("scopes invoice status groupBy to chart period created_at", async () => {
    await fetchRevenueAggregates({}, "month", now);
    expect(mockInvoiceGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          created_at: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      })
    );
  });
});
