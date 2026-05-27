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
    },
    $queryRaw: mockQueryRaw,
  },
}));

import {
  countAppointmentsByStatusInRange,
  countDistinctPatientsInPeriodToNow,
  fetchAvgDurationMinutesInRange,
  fetchBusiestDayOfWeekCounts,
  fetchDoctorBreakdown,
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
