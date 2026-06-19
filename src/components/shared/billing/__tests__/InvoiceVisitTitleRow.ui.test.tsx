import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { InvoiceVisitTitleRow } from "@/components/shared/billing/InvoiceVisitTitleRow";

vi.mock("@/components/shared/EntityTitleLink", () => ({
  EntityTitleLink: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock("@/components/shared/appointments/AppointmentStatusGlassBadge", () => ({
  AppointmentStatusGlassBadge: ({ status }: { status: string }) => (
    <span data-testid="appt-status">{status}</span>
  ),
}));

describe("InvoiceVisitTitleRow", () => {
  it("renders linked visit status beside title", () => {
    const markup = renderToStaticMarkup(
      <InvoiceVisitTitleRow
        href="/appointments/a1"
        title="Follow-up Visit"
        invoice={{
          visit_summary: { appointment_status: "cancelled" },
        }}
      />
    );
    expect(markup).toContain("Follow-up Visit");
    expect(markup).toContain('data-testid="appt-status"');
    expect(markup).toContain("cancelled");
  });
});
