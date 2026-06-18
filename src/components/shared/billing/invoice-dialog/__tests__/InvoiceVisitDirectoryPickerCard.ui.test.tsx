import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { InvoiceVisitDirectoryPickerCard } from "@/components/shared/billing/invoice-dialog/InvoiceVisitDirectoryPickerCard";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";

vi.mock("@/components/shared/person-display/PatientPortraitAvatar", () => ({
  PatientPortraitAvatar: () => <span data-testid="patient-avatar" />,
}));

vi.mock("@/components/shared/person-display/DoctorIdentityCell", () => ({
  DoctorIdentityCell: () => <span>Doctor</span>,
}));

vi.mock("@/components/shared/billing/InvoiceVisitMetaLine", () => ({
  InvoiceVisitMetaLine: ({ variant }: { variant?: string }) => (
    <span data-testid="visit-meta" data-variant={variant} />
  ),
}));

vi.mock("@/components/shared/appointment-display/AppointmentTypeGlassBadge", () => ({
  AppointmentTypeGlassBadge: () => <span data-testid="title-type-badge" />,
}));

const option = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Annual Check-up",
  start: "2026-06-08T09:00:00.000Z",
  end: "2026-06-08T10:00:00.000Z",
  owner_id: "user-1",
  patient_label: "Maria Schmidt",
  eligible: true,
  block_reason: null,
  invoice_id: null,
  invoice_status: null,
  display_status: null,
  amount_cents: null,
  currency: null,
  suggested_amount_cents: null,
  when_label: "Mon 10:00",
  appointment_type_name: "Annual Check-up",
  duration_minutes: 60,
} as InvoiceAppointmentOptionRow;

describe("InvoiceVisitDirectoryPickerCard", () => {
  it("uses icons meta on when line without title-row type badge", () => {
    const markup = renderToStaticMarkup(
      <InvoiceVisitDirectoryPickerCard
        option={option}
        selected={false}
        viewerRole="admin"
        onSelect={() => undefined}
      />
    );
    expect(markup).toContain('data-variant="icons"');
    expect(markup).not.toContain('data-testid="title-type-badge"');
  });
});
