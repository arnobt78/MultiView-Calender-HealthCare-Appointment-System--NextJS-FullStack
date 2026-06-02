import { describe, expect, it } from "vitest";
import {
  countDoctorPortalInvoicesByStatus,
  doctorPortalBillingPanelTitleLine,
  doctorPortalBillingSectionTitle,
  doctorPortalInvoiceStatusBadgeLabel,
} from "@/lib/doctor-portal-billing-display";
import type { InvoiceRow } from "@/lib/billing-types";

const row = (status: InvoiceRow["status"]): InvoiceRow => ({
  id: "11111111-1111-1111-1111-111111111111",
  user_id: "doc-1",
  amount: 1000,
  currency: "eur",
  status,
  created_at: "2026-06-02T10:00:00.000Z",
  payments: [],
});

describe("doctorPortalBillingSectionTitle", () => {
  it("uses possessive display name when present", () => {
    expect(doctorPortalBillingSectionTitle("Demo Doctor")).toBe("Demo Doctor's Related Billing");
  });

  it("falls back when name missing", () => {
    expect(doctorPortalBillingSectionTitle(undefined)).toBe("My Related Billing");
  });
});

describe("countDoctorPortalInvoicesByStatus", () => {
  it("counts each display status separately", () => {
    const counts = countDoctorPortalInvoicesByStatus([
      row("draft"),
      row("sent"),
      row("paid"),
    ]);
    expect(counts.draft).toBe(1);
    expect(counts.sent).toBe(1);
    expect(counts.paid).toBe(1);
    expect(counts.overdue).toBe(0);
  });
});

describe("doctorPortalBillingPanelTitleLine", () => {
  it("includes total and status breakdown in the header line", () => {
    expect(
      doctorPortalBillingPanelTitleLine("Demo Doctor", 6, {
        draft: 1,
        sent: 1,
        paid: 2,
        overdue: 0,
        cancelled: 1,
        refunded: 1,
      })
    ).toBe(
      "Demo Doctor's Related Billing (6) (Draft: 1 · Sent: 1 · Paid: 2 · Overdue: 0 · Cancelled: 1 · Refunded: 1)"
    );
  });
});

describe("doctorPortalInvoiceStatusBadgeLabel", () => {
  it("lists every status like the Today KPI chip", () => {
    const label = doctorPortalInvoiceStatusBadgeLabel({
      draft: 1,
      sent: 1,
      paid: 0,
      overdue: 0,
      cancelled: 0,
      refunded: 0,
    });
    expect(label).toBe("Draft: 1 · Sent: 1 · Paid: 0 · Overdue: 0 · Cancelled: 0 · Refunded: 0");
  });
});
