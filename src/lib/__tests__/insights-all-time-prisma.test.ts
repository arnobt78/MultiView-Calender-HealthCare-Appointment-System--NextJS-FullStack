import { describe, expect, it, vi, beforeEach } from "vitest";

const mockAppointmentGroupBy = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockDoctorTimeOffFindMany = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockUserFindMany = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const mockAppointmentCount = vi.hoisted(() => vi.fn().mockResolvedValue(0));
const mockInvoiceAggregate = vi.hoisted(() => vi.fn().mockResolvedValue({ _sum: { amount: 0 } }));
const mockDoctorAvailabilityFindMany = vi.hoisted(() => vi.fn().mockResolvedValue([]));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: {
      groupBy: mockAppointmentGroupBy,
      count: mockAppointmentCount,
    },
    doctorTimeOff: { findMany: mockDoctorTimeOffFindMany },
    doctorAvailability: { findMany: mockDoctorAvailabilityFindMany },
    user: { findMany: mockUserFindMany },
    invoice: { aggregate: mockInvoiceAggregate },
    $queryRaw: vi.fn().mockResolvedValue([]),
  },
}));

import { countAppointmentsByStatusForPeriod } from "@/lib/insights/insights-aggregate";
import { fetchDoctorInsightsSection } from "@/lib/insights/insights-doctor-aggregate";
import { INSIGHTS_ALL_TIME_RANGE_END } from "@/lib/insights/insights-period";

describe("insights period=all Prisma safety", () => {
  beforeEach(() => {
    mockAppointmentGroupBy.mockClear();
    mockDoctorTimeOffFindMany.mockClear();
    mockUserFindMany.mockResolvedValue([
      { id: "doc-1", display_name: "Dr A", email: "a@test.com", specialty: null },
    ]);
  });

  it("status for all-time does not pass start filter to groupBy", async () => {
    await countAppointmentsByStatusForPeriod({}, "all", new Date());
    expect(mockAppointmentGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      })
    );
    const where = mockAppointmentGroupBy.mock.calls[0]?.[0]?.where as {
      start?: unknown;
    };
    expect(where.start).toBeUndefined();
  });

  it("doctor time-off for all-time omits invalid DateTime bounds", async () => {
    await fetchDoctorInsightsSection({
      organizationWide: true,
      filterOwnerId: "doc-1",
      period: "all",
      now: new Date(),
    });
    expect(mockDoctorTimeOffFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: "doc-1" },
      })
    );
    const where = mockDoctorTimeOffFindMany.mock.calls[0]?.[0]?.where as Record<
      string,
      unknown
    >;
    expect(where.starts_at).toBeUndefined();
    expect(where.ends_at).toBeUndefined();
  });

  it("all-time display end is Prisma-safe (not +275760)", () => {
    expect(INSIGHTS_ALL_TIME_RANGE_END.getUTCFullYear()).toBe(2100);
    expect(INSIGHTS_ALL_TIME_RANGE_END.toISOString()).not.toContain("+275760");
  });
});
