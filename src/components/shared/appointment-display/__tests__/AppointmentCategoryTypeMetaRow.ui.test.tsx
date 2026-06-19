import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AppointmentCategoryTypeMetaRow } from "@/components/shared/appointment-display/AppointmentCategoryTypeMetaRow";

vi.mock("@/components/shared/CategoryInlineLink", () => ({
  CategoryInlineLink: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock("@/components/shared/appointment-display/AppointmentTypeGlassBadge", () => ({
  AppointmentTypeGlassBadge: ({ name }: { name: string }) => <span>{name}</span>,
}));

vi.mock("@/components/shared/billing/VisitFeeBadge", () => ({
  VisitFeeBadge: ({ priceCents }: { priceCents: number }) => (
    <span data-testid="fee">€{priceCents / 100}</span>
  ),
}));

vi.mock("@/components/shared/billing/InvoiceStatusBadge", () => ({
  InvoiceStatusBadge: ({ displayStatus }: { displayStatus: string }) => (
    <span data-testid="invoice-status">{displayStatus}</span>
  ),
}));

describe("AppointmentCategoryTypeMetaRow", () => {
  it("renders invoice status inline after fee", () => {
    const markup = renderToStaticMarkup(
      <AppointmentCategoryTypeMetaRow
        category={{
          categoryId: "cat-1",
          label: "Primary Care",
        }}
        appointment={{
          appointment_type_name: "Initial Consultation",
          duration_minutes: 30,
        }}
        displayFeeCents={15000}
        invoiceDisplayStatus="paid"
      />
    );
    expect(markup).toContain("Primary Care");
    expect(markup).toContain("Initial Consultation");
    expect(markup).toContain('data-testid="fee"');
    expect(markup).toContain('data-testid="invoice-status"');
    expect(markup).toContain("paid");
  });
});
