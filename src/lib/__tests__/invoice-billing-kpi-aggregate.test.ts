import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    invoice: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  emptyInvoiceBillingStatusPayload,
  fetchInvoiceBillingKpiPayloadForWhere,
  fetchInvoiceBillingStatusPayloadForWhere,
  fetchInvoiceExtendedKpisForWhere,
  fetchInvoicePaidPeriodForWhere,
} from "@/lib/invoice-billing-kpi-aggregate";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchInvoicePaidPeriodForWhere", () => {
  it("aggregates current and prior month paid revenue", async () => {
    vi.mocked(prisma.invoice.aggregate)
      .mockResolvedValueOnce({ _sum: { amount: 5000 }, _count: 2 } as never)
      .mockResolvedValueOnce({ _sum: { amount: 3000 }, _count: 0 } as never);

    const result = await fetchInvoicePaidPeriodForWhere({});

    expect(result).toEqual({
      paidInPeriodCents: 5000,
      paidInPeriodCount: 2,
      paidPrevPeriodCents: 3000,
    });
    expect(prisma.invoice.aggregate).toHaveBeenCalledTimes(2);
  });
});

describe("fetchInvoiceExtendedKpisForWhere", () => {
  it("rolls up volume and payment success from minimal select", async () => {
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([
      {
        amount: 10_000,
        payments: [{ status: "succeeded" }, { status: "failed" }],
      },
      { amount: 5_000, payments: [] },
    ] as never);

    const result = await fetchInvoiceExtendedKpisForWhere({});

    expect(result.totalCount).toBe(2);
    expect(result.totalAmountCents).toBe(15_000);
    expect(result.paymentAttemptCount).toBe(2);
    expect(result.paymentSuccessPct).toBe(50);
  });
});

describe("fetchInvoiceBillingStatusPayloadForWhere", () => {
  it("returns status rollups only — no findMany", async () => {
    vi.mocked(prisma.invoice.aggregate).mockResolvedValue({
      _sum: { amount: 9000 },
      _count: 1,
    } as never);

    const result = await fetchInvoiceBillingStatusPayloadForWhere({});

    expect(result.totals.paid.cents).toBeGreaterThanOrEqual(0);
    expect(result.paidPeriod).toBeUndefined();
    expect(result.extendedKpis).toBeUndefined();
    expect(prisma.invoice.findMany).not.toHaveBeenCalled();
  });

  it("excludes soft-deleted invoices from KPI aggregates", async () => {
    vi.mocked(prisma.invoice.aggregate).mockResolvedValue({
      _sum: { amount: 0 },
      _count: 0,
    } as never);

    await fetchInvoiceBillingStatusPayloadForWhere({ user_id: "doc-1" });

    expect(prisma.invoice.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            { user_id: "doc-1" },
            { deleted_at: null },
          ]),
        }),
      })
    );
  });
});

describe("fetchInvoiceBillingKpiPayloadForWhere", () => {
  it("composes status, period, and extended KPIs for insights callers", async () => {
    vi.mocked(prisma.invoice.aggregate).mockResolvedValue({
      _sum: { amount: 9000 },
      _count: 1,
    } as never);
    vi.mocked(prisma.invoice.findMany).mockResolvedValue([
      { amount: 9000, payments: [{ status: "succeeded" }] },
    ] as never);

    const result = await fetchInvoiceBillingKpiPayloadForWhere({});

    expect(result.paidPeriod).toBeDefined();
    expect(result.extendedKpis?.totalCount).toBe(1);
    expect(prisma.invoice.findMany).toHaveBeenCalled();
  });
});

describe("emptyInvoiceBillingStatusPayload", () => {
  it("returns zeroed status fields only", () => {
    const empty = emptyInvoiceBillingStatusPayload();
    expect(empty.totals.paid.cents).toBe(0);
    expect(empty.paidPeriod).toBeUndefined();
    expect(empty.extendedKpis).toBeUndefined();
  });
});
