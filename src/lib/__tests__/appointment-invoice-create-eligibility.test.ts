import { describe, expect, it } from "vitest";
import { canShowCreateInvoiceAction } from "@/lib/appointment-invoice-create-eligibility";

describe("canShowCreateInvoiceAction", () => {
  it("allows admin/doctor when no invoice exists", () => {
    expect(canShowCreateInvoiceAction({ role: "admin", invoiceDisplayStatus: null })).toBe(
      true
    );
    expect(canShowCreateInvoiceAction({ role: "doctor", invoiceDisplayStatus: undefined })).toBe(
      true
    );
  });

  it("blocks patient role", () => {
    expect(canShowCreateInvoiceAction({ role: "patient" })).toBe(false);
  });

  it("blocks when visit has paid invoice", () => {
    expect(
      canShowCreateInvoiceAction({ role: "admin", invoiceDisplayStatus: "paid" })
    ).toBe(false);
  });

  it("allows when invoice is cancelled (non-blocking)", () => {
    expect(
      canShowCreateInvoiceAction({ role: "doctor", invoiceDisplayStatus: "cancelled" })
    ).toBe(true);
  });
});
