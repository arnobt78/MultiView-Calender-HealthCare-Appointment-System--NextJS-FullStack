import { describe, it, expect } from "vitest";
import {
  buildInvoiceStatusTotalsFromGroupBy,
  computeInvoiceBillingStatusTotals,
  computeInvoiceBillingTotals,
  rollupInvoiceBillingTotals,
} from "@/lib/invoice-billing-totals";

/** Mirrors db:seed-demo-appointments curated invoice amounts/statuses. */
const CURATED_FIXTURE = [
  { amount: 10_000, status: "refunded" },
  { amount: 9_750, status: "cancelled" },
  { amount: 9_500, status: "sent" },
  { amount: 9_250, status: "draft" },
  { amount: 9_000, status: "paid" },
  { amount: 8_500, status: "paid" },
] as const;

describe("computeInvoiceBillingTotals", () => {
  it("matches curated demo KPI buckets", () => {
    const t = computeInvoiceBillingTotals([...CURATED_FIXTURE]);
    expect(t.paid).toEqual({ cents: 17_500, count: 2 });
    expect(t.outstanding).toEqual({ cents: 18_750, count: 2 });
    expect(t.refunded).toEqual({ cents: 10_000, count: 1 });
    expect(t.cancelled).toEqual({ cents: 9_750, count: 1 });
  });

  it("does not count refunded toward outstanding", () => {
    const t = computeInvoiceBillingTotals([
      { amount: 10_000, status: "refunded" },
      { amount: 9_500, status: "sent" },
    ]);
    expect(t.outstanding.cents).toBe(9_500);
    expect(t.refunded.cents).toBe(10_000);
  });
});

describe("computeInvoiceBillingStatusTotals", () => {
  it("tracks draft, sent, overdue separately", () => {
    const status = computeInvoiceBillingStatusTotals([
      { amount: 1_000, status: "draft" },
      { amount: 2_000, status: "sent" },
      { amount: 3_000, status: "overdue" },
    ]);
    expect(status.draft).toEqual({ cents: 1_000, count: 1 });
    expect(status.sent).toEqual({ cents: 2_000, count: 1 });
    expect(status.overdue).toEqual({ cents: 3_000, count: 1 });
    const rollup = rollupInvoiceBillingTotals(status);
    expect(rollup.outstanding).toEqual({ cents: 6_000, count: 3 });
  });
});

describe("buildInvoiceStatusTotalsFromGroupBy", () => {
  it("maps prisma groupBy rows", () => {
    const status = buildInvoiceStatusTotalsFromGroupBy([
      { status: "paid", _count: { _all: 2 }, _sum: { amount: 17_500 } },
      { status: "draft", _count: { _all: 1 }, _sum: { amount: 9_250 } },
    ]);
    expect(status.paid).toEqual({ cents: 17_500, count: 2 });
    expect(status.draft).toEqual({ cents: 9_250, count: 1 });
    expect(status.sent.count).toBe(0);
  });
});
