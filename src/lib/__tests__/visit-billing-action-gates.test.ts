import { describe, expect, it } from "vitest";
import {
  isVisitBillingFrozen,
  linkedAppointmentStatusFromInvoice,
} from "@/lib/visit-billing-action-gates";

describe("visit-billing-action-gates", () => {
  it("freezes billing only when visit is cancelled", () => {
    expect(isVisitBillingFrozen("cancelled")).toBe(true);
    expect(isVisitBillingFrozen("pending")).toBe(false);
    expect(isVisitBillingFrozen("done")).toBe(false);
    expect(isVisitBillingFrozen("alert")).toBe(false);
    expect(isVisitBillingFrozen(null)).toBe(false);
  });

  it("reads linked appointment status from visit_summary", () => {
    expect(
      linkedAppointmentStatusFromInvoice({
        visit_summary: { appointment_status: "cancelled" },
      })
    ).toBe("cancelled");
    expect(linkedAppointmentStatusFromInvoice({ visit_summary: null })).toBe(null);
  });
});
