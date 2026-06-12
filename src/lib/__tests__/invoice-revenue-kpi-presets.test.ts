import { describe, it, expect } from "vitest";
import {
  invoiceKpiCountBadge,
  invoiceKpiValueRowHint,
  INVOICE_KPI_ZERO_HINTS,
} from "@/lib/invoice-revenue-kpi-presets";

describe("invoiceKpiCountBadge", () => {
  it("returns undefined for zero count", () => {
    expect(invoiceKpiCountBadge(0, "paid")).toBeUndefined();
  });

  it("pluralizes count labels", () => {
    expect(invoiceKpiCountBadge(2, "paid")).toBe("2 paids");
    expect(invoiceKpiCountBadge(1, "open")).toBe("1 open");
  });
});

describe("invoiceKpiValueRowHint", () => {
  it("returns count label when count > 0", () => {
    expect(invoiceKpiValueRowHint(2, "paid")).toBe("2 paids");
    expect(invoiceKpiValueRowHint(3, "attempt")).toBe("3 attempts");
  });

  it("returns custom zero hint when count is 0", () => {
    expect(invoiceKpiValueRowHint(0, "overdue", INVOICE_KPI_ZERO_HINTS.overdue)).toBe(
      "No overdue yet"
    );
    expect(invoiceKpiValueRowHint(0, "paid", INVOICE_KPI_ZERO_HINTS.paid)).toBe(
      "No paid invoices yet"
    );
  });
});
