import { describe, expect, it } from "vitest";
import {
  resolveAppointmentBillingSummary,
  resolveInvoiceDisplayStatus,
  isBlockingInvoiceStatus,
} from "@/lib/billing-appointment-eligibility";

describe("billing-appointment-eligibility", () => {
  it("blocks visits with paid or open invoices", () => {
    expect(isBlockingInvoiceStatus("paid")).toBe(true);
    expect(isBlockingInvoiceStatus("draft")).toBe(true);
    expect(resolveAppointmentBillingSummary({
      id: "inv-1",
      status: "paid",
      amount: 6900,
      currency: "eur",
      payments: [{ status: "succeeded" }],
    }).eligible).toBe(false);
  });

  it("allows rebill after cancelled", () => {
    const summary = resolveAppointmentBillingSummary({
      id: "inv-2",
      status: "cancelled",
      amount: 6900,
      currency: "eur",
      payments: [{ status: "refunded" }],
    });
    expect(summary.eligible).toBe(true);
    expect(summary.displayStatus).toBe("refunded");
  });

  it("shows refunded display when payment refunded", () => {
    expect(
      resolveInvoiceDisplayStatus({
        status: "cancelled",
        payments: [{ status: "refunded" }],
      })
    ).toBe("refunded");
  });

  it("no invoice means eligible", () => {
    expect(resolveAppointmentBillingSummary(null).eligible).toBe(true);
  });
});
