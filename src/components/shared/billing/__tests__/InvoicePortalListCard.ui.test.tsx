import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { InvoicePortalListCard } from "@/components/shared/billing/InvoicePortalListCard";
import type { Invoice } from "@/hooks/usePayments";

vi.mock("@/components/shared/billing/invoice-table-cells", () => ({
  InvoiceNumberTableCell: () => <span>Invoice 1</span>,
  InvoiceDescriptionTableCell: () => <span data-testid="desc">desc</span>,
}));

vi.mock("@/components/shared/billing/InvoiceAmountDisplay", () => ({
  InvoiceAmountDisplay: () => <span>€92</span>,
}));

vi.mock("@/components/shared/billing/InvoiceStatusBadge", () => ({
  InvoiceStatusBadge: () => <span>Draft</span>,
}));

vi.mock("@/components/shared/billing/InvoicePortalListMetaRow", () => ({
  InvoicePortalListMetaRow: () => <span>meta</span>,
}));

const baseInvoice = {
  id: "inv-1",
  user_id: "doc-1",
  amount: 9250,
  currency: "eur",
  status: "draft",
  created_at: "2026-06-01T10:00:00.000Z",
  payments: [],
  visit_summary: {
    appointment_id: "appt-1",
    title: "Follow-up",
    appointment_status: "cancelled",
    start_iso: "2026-06-01T10:00:00.000Z",
    end_iso: "2026-06-01T10:30:00.000Z",
    when_label: "Mon",
    location_label: "Clinic",
    is_telehealth: false,
    patient_id: null,
    patient_label: null,
    category_id: null,
    category_label: null,
    category_color: null,
    category_icon: null,
    treating_physician_id: null,
    treating_physician_label: null,
    treating_physician_specialty: null,
    calendar_owner_id: null,
    calendar_owner_label: null,
    calendar_owner_specialty: null,
  },
} as Invoice;

describe("InvoicePortalListCard", () => {
  it("applies muted shell when linked visit is cancelled", () => {
    const markup = renderToStaticMarkup(
      <InvoicePortalListCard
        invoice={baseInvoice}
        viewerRole="doctor"
        shellClassName="shell"
        headerStripClassName="strip"
      />
    );
    expect(markup).toContain("opacity-75");
  });
});
