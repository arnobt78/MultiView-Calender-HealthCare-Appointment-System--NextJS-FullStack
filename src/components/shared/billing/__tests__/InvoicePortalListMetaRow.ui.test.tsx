import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { InvoicePortalListMetaRow } from "@/components/shared/billing/InvoicePortalListMetaRow";
import type { Invoice } from "@/hooks/usePayments";

vi.mock("@/components/shared/billing/InvoiceIssuedByMeta", () => ({
  InvoiceIssuedByMeta: ({ layout }: { layout?: string }) => (
    <span data-testid="issued-meta" data-layout={layout ?? ""} />
  ),
}));

vi.mock("@/components/shared/billing/InvoiceDeletionActorMeta", () => ({
  InvoiceDeletionActorMeta: () => null,
}));

vi.mock("@/components/shared/billing/invoice-table-cells", () => ({
  InvoiceDueTableCell: () => <span>due-cell</span>,
}));

const baseInvoice = (): Invoice =>
  ({
    id: "11111111-1111-4111-8111-111111111111",
    user_id: "doc-1",
    amount: 12_000,
    currency: "eur",
    status: "draft",
    created_at: "2026-06-02T10:00:00.000Z",
    due_date: "2026-06-15T10:00:00.000Z",
    payments: [],
    issuer_label: "Demo Doctor",
  }) as Invoice;

describe("InvoicePortalListMetaRow", () => {
  it("uses wrapInline issued-by layout for one responsive meta row", () => {
    const markup = renderToStaticMarkup(
      <InvoicePortalListMetaRow invoice={baseInvoice()} viewerRole="doctor" />
    );
    expect(markup).toContain('data-layout="wrapInline"');
    expect(markup).toContain("Due:");
    expect(markup).toContain("Created:");
  });
});
