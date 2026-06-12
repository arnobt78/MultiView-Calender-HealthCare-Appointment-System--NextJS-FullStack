import { describe, expect, it } from "vitest";
import {
  ALL_BILLING_SECTION_TITLE,
  ALL_BILLING_SUBTITLE,
  countInvoicesByDisplayStatus,
  countInvoicesForOrganization,
  invoiceManagementSectionSubtitle,
  invoiceManagementSectionTitle,
  organizationBillingScopeSubtitle,
} from "@/lib/invoice-management-display";
import type { InvoiceRow } from "@/lib/billing-types";

const baseInvoice: InvoiceRow = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "22222222-2222-4222-8222-222222222222",
  amount: 1000,
  currency: "eur",
  status: "draft",
  created_at: "2026-01-01T00:00:00.000Z",
  payments: [],
};

describe("invoice-management-display", () => {
  it("all scope title and subtitle", () => {
    expect(invoiceManagementSectionTitle({ scope: "all" })).toBe(
      ALL_BILLING_SECTION_TITLE
    );
    expect(invoiceManagementSectionSubtitle({ scope: "all" })).toBe(
      ALL_BILLING_SUBTITLE
    );
  });

  it("org scope uses possessive org title and unscoped note in subtitle", () => {
    expect(
      invoiceManagementSectionTitle(
        { scope: "org", orgId: "33333333-3333-4333-8333-333333333333" },
        { organizationName: "Acme Clinic" }
      )
    ).toBe("Acme Clinic's Related Billing");
    expect(
      invoiceManagementSectionSubtitle({
        scope: "org",
        orgId: "33333333-3333-4333-8333-333333333333",
      })
    ).toBe(organizationBillingScopeSubtitle());
  });

  it("countInvoicesByDisplayStatus tallies display status", () => {
    const counts = countInvoicesByDisplayStatus([
      { ...baseInvoice, status: "draft" },
      { ...baseInvoice, id: "44444444-4444-4444-8444-444444444444", status: "paid" },
    ]);
    expect(counts.draft).toBe(1);
    expect(counts.paid).toBe(1);
  });

  it("countInvoicesForOrganization filters by organization_id", () => {
    const orgId = "55555555-5555-4555-8555-555555555555";
    expect(
      countInvoicesForOrganization(
        [
          { ...baseInvoice, organization_id: orgId },
          { ...baseInvoice, id: "66666666-6666-4666-8666-666666666666" },
        ],
        orgId
      )
    ).toBe(1);
  });
});
