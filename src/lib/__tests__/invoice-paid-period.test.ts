import { describe, expect, it } from "vitest";
import { computeInvoicePaidPeriodComparison } from "@/lib/invoice-paid-period";
import { formatInsightsRevenuePeriodComparison } from "@/lib/insights/insights-kpi-format";

describe("computeInvoicePaidPeriodComparison", () => {
  const now = new Date("2026-06-02T12:00:00Z");

  it("counts paid with null paid_at via created_at fallback", () => {
    const result = computeInvoicePaidPeriodComparison(
      [
        {
          amount: 10_000,
          status: "paid",
          paid_at: null,
          created_at: "2026-06-01T10:00:00Z",
        },
      ],
      "month",
      now
    );
    expect(result.paidInPeriodCents).toBe(10_000);
    expect(result.paidInPeriodCount).toBe(1);
  });
});

describe("formatInsightsRevenuePeriodComparison", () => {
  it("returns positive percent when current exceeds prior", () => {
    const { delta } = formatInsightsRevenuePeriodComparison(21_250, 9_250);
    expect(delta?.positive).toBe(true);
    expect(delta?.text).toMatch(/^\+/);
  });
});
