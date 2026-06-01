import { describe, it, expect } from "vitest";
import { computeInvoiceBillingTotals } from "@/lib/invoice-billing-totals";

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
