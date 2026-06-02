import { describe, expect, it, vi, beforeEach } from "vitest";

const mockAppointmentCount = vi.hoisted(() => vi.fn().mockResolvedValue(0));
const mockAppointmentFindMany = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockAppointmentGroupBy = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockQueryRaw = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockInvoiceGroupBy = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockInvoiceAggregate = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ _sum: { amount: 0 } })
);
const mockUserFindMany = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockUserFindFirst = vi.hoisted(() => vi.fn().mockResolvedValue(null));
const mockDoctorAvailabilityFindMany = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockDoctorTimeOffFindMany = vi.hoisted(() => vi.fn().mockResolvedValue([]));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: {
      count: mockAppointmentCount,
      findMany: mockAppointmentFindMany,
      groupBy: mockAppointmentGroupBy,
    },
    invoice: {
      groupBy: mockInvoiceGroupBy,
      aggregate: mockInvoiceAggregate,
    },
    user: {
      findMany: mockUserFindMany,
      findFirst: mockUserFindFirst,
    },
    doctorAvailability: {
      findMany: mockDoctorAvailabilityFindMany,
    },
    doctorTimeOff: {
      findMany: mockDoctorTimeOffFindMany,
    },
    $queryRaw: mockQueryRaw,
  },
}));

import {
  countAppointmentsByStatusForPeriod,
  countAppointmentsByStatusInRange,
  fetchTelehealthShareForPeriod,
  countDistinctPatientsInPeriodToNow,
  fetchAvgDurationMinutesInRange,
  fetchBusiestDayOfWeekCounts,
  fetchDoctorBreakdown,
  fetchRevenueAggregates,
  fetchRevenueTrendByPeriod,
  fetchStatusOverTimeByPeriod,
  fetchTrendCountsByPeriod,
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

  it("all uses SQL year/month buckets", async () => {
    mockQueryRaw
      .mockResolvedValueOnce([
        { min_start: new Date("2020-01-01"), max_start: new Date("2026-01-01") },
      ])
      .mockResolvedValueOnce([
        { bucket_start: new Date("2024-01-01"), count: BigInt(2) },
      ])
      .mockResolvedValueOnce([
        {
          bucket_start: new Date("2024-01-01"),
          done: BigInt(1),
          pending: BigInt(1),
          alert: BigInt(0),
        },
      ]);
    const rows = await fetchStatusOverTimeByPeriod({}, "all", now);
    expect(rows.length).toBeGreaterThan(0);
    expect(mockQueryRaw).toHaveBeenCalled();
  });
});

describe("fetchTrendCountsByPeriod all", () => {
  const now = new Date("2026-05-26T12:00:00Z");

  beforeEach(() => {
    mockQueryRaw.mockReset();
    mockQueryRaw.mockResolvedValue([
      { min_start: new Date("2020-01-01"), max_start: new Date("2026-01-01") },
    ]);
  });

  it("uses SQL groupBy for all-time", async () => {
    mockQueryRaw
      .mockResolvedValueOnce([
        { min_start: new Date("2020-01-01"), max_start: new Date("2026-01-01") },
      ])
      .mockResolvedValueOnce([
        { bucket_start: new Date("2025-01-01"), count: BigInt(3) },
      ]);
    const rows = await fetchTrendCountsByPeriod({}, "all", now);
    expect(rows.length).toBeGreaterThan(0);
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
    mockInvoiceGroupBy.mockResolvedValue([
      { status: "paid", _count: { _all: 3 }, _sum: { amount: 9000 } },
    ]);
    mockInvoiceAggregate.mockResolvedValue({ _sum: { amount: 9000 }, _count: 3 });
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

  it("all-time omits created_at filter and sets paidPrevPeriod to 0", async () => {
    mockInvoiceAggregate.mockResolvedValue({ _sum: { amount: 9000 }, _count: 2 });
    const result = await fetchRevenueAggregates({}, "all", now);
    expect(mockInvoiceGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        _sum: { amount: true },
      })
    );
    expect(result.paidPrevPeriod).toBe(0);
    expect(result.paidInPeriodCount).toBe(2);
    expect(result.statusTotals.paid.cents).toBe(9000);
  });
});

describe("fetchRevenueTrendByPeriod period=all scoped", () => {
  const now = new Date("2026-06-01T12:00:00Z");

  beforeEach(() => {
    mockInvoiceAggregate.mockClear();
    mockInvoiceAggregate.mockResolvedValue({ _sum: { amount: 5900 } });
  });

  it("uses paid_at not-null only (no invalid max date)", async () => {
    const rows = await fetchRevenueTrendByPeriod(
      { OR: [{ user_id: "doc-a" }] },
      "all",
      now
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.count).toBe(5900);
    expect(mockInvoiceAggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "paid",
          paid_at: { not: null },
        }),
      })
    );
  });
});

describe("countAppointmentsByStatusForPeriod", () => {
  beforeEach(() => {
    mockAppointmentGroupBy.mockClear();
    mockAppointmentGroupBy.mockResolvedValue([
      { status: "done", _count: { _all: 1 } },
    ]);
  });

  it("all-time does not filter appointment start", async () => {
    await countAppointmentsByStatusForPeriod({}, "all", new Date());
    expect(mockAppointmentGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      })
    );
  });
});

describe("fetchTelehealthShareForPeriod", () => {
  const now = new Date("2026-06-02T12:00:00Z");

  beforeEach(() => {
    mockAppointmentCount.mockClear();
    mockAppointmentCount.mockResolvedValue(0);
  });

  it("all-time counts telehealth and visits without start filter", async () => {
    mockAppointmentCount
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(10);
    const result = await fetchTelehealthShareForPeriod({}, "all", now);
    expect(result).toEqual({
      telehealthCount: 3,
      visitCount: 10,
      telehealthPct: 30,
    });
    expect(mockAppointmentCount).toHaveBeenNthCalledWith(1, {
      where: { is_telehealth: true },
    });
    expect(mockAppointmentCount).toHaveBeenNthCalledWith(2, {
      where: {},
    });
  });

  it("month scopes both counts to appointment start in calendar month", async () => {
    mockAppointmentCount.mockResolvedValue(0);
    await fetchTelehealthShareForPeriod({}, "month", now);
    expect(mockAppointmentCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          start: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
          is_telehealth: true,
        }),
      })
    );
    expect(mockAppointmentCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          start: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      })
    );
  });

  it("returns 0% when no visits in period", async () => {
    const result = await fetchTelehealthShareForPeriod({}, "day", now);
    expect(result.telehealthPct).toBe(0);
  });
});

describe("countAppointmentsByStatusInRange", () => {
  const rangeStart = new Date("2026-05-01T00:00:00Z");
  const rangeEnd = new Date("2026-05-31T23:59:59.999Z");

  beforeEach(() => {
    mockAppointmentGroupBy.mockClear();
    mockAppointmentGroupBy.mockResolvedValue([
      { status: "done", _count: { _all: 2 } },
    ]);
  });

  it("scopes status groupBy to appointment start within range", async () => {
    await countAppointmentsByStatusInRange({}, rangeStart, rangeEnd);
    expect(mockAppointmentGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          start: { gte: rangeStart, lte: rangeEnd },
        }),
      })
    );
  });
});

describe("fetchAvgDurationMinutesInRange", () => {
  const rangeStart = new Date("2026-05-01T00:00:00Z");
  const rangeEnd = new Date("2026-05-31T23:59:59.999Z");

  beforeEach(() => {
    mockAppointmentFindMany.mockClear();
    mockAppointmentFindMany.mockResolvedValue([
      { duration_minutes: 30, start: new Date(), end: new Date() },
    ]);
  });

  it("scopes findMany to appointment start in range", async () => {
    await fetchAvgDurationMinutesInRange({}, rangeStart, rangeEnd);
    expect(mockAppointmentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          start: { gte: rangeStart, lte: rangeEnd },
        }),
      })
    );
  });
});

describe("countDistinctPatientsInPeriodToNow", () => {
  const rangeStart = new Date("2026-05-01T00:00:00Z");
  const rangeEnd = new Date("2026-05-31T23:59:59.999Z");
  const now = new Date("2026-05-15T12:00:00Z");

  beforeEach(() => {
    mockAppointmentGroupBy.mockClear();
    mockAppointmentGroupBy.mockResolvedValue([{ patient_id: "p1", _count: { _all: 1 } }]);
  });

  it("clips range end to now for patient groupBy", async () => {
    await countDistinctPatientsInPeriodToNow({}, rangeStart, rangeEnd, now);
    expect(mockAppointmentGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          start: { gte: rangeStart, lte: now },
        }),
      })
    );
  });
});

describe("fetchDoctorBreakdown", () => {
  const now = new Date("2026-05-26T12:00:00Z");

  beforeEach(() => {
    mockUserFindMany.mockClear();
    mockAppointmentCount.mockClear();
    mockInvoiceAggregate.mockClear();
    mockUserFindMany.mockResolvedValue([
      { id: "doc-1", display_name: "Dr A", email: "a@test.com", specialty: "General" },
    ]);
    mockAppointmentCount.mockResolvedValue(3);
    mockInvoiceAggregate.mockResolvedValue({ _sum: { amount: 5000 } });
  });

  it("returns null when not organization-wide", async () => {
    const rows = await fetchDoctorBreakdown(false, "month", now);
    expect(rows).toBeNull();
    expect(mockUserFindMany).not.toHaveBeenCalled();
  });

  it("filters appointment count and paid revenue by chart period", async () => {
    await fetchDoctorBreakdown(true, "day", now);
    expect(mockAppointmentCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          owner_id: "doc-1",
          start: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      })
    );
    expect(mockInvoiceAggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          user_id: "doc-1",
          status: "paid",
          paid_at: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      })
    );
  });

  it("uses different paid_at window for month vs day period", async () => {
    await fetchDoctorBreakdown(true, "day", now);
    const dayPaidAt = mockInvoiceAggregate.mock.calls[0]?.[0]?.where?.paid_at;

    mockInvoiceAggregate.mockClear();
    await fetchDoctorBreakdown(true, "month", now);
    const monthPaidAt = mockInvoiceAggregate.mock.calls[0]?.[0]?.where?.paid_at;

    expect(dayPaidAt?.gte?.getTime()).not.toBe(monthPaidAt?.gte?.getTime());
  });
});
