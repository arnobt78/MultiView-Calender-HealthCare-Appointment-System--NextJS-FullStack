import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AdminPortalAppointmentListRow } from "@/components/admin-portal/AdminPortalAppointmentListRow";
import type { AdminPortalAppointmentRow } from "@/types/types";

vi.mock("@/components/shared/RoleEntityLink", () => ({
  RoleEntityLink: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock("@/context/AppointmentColorContext", () => ({
  resolveAppointmentLineColor: () => "#000",
}));

vi.mock("@/components/shared/appointment-display/AppointmentTypeGlassBadge", () => ({
  AppointmentTypeGlassBadge: ({ name }: { name: string }) => (
    <span data-testid="type-badge">{name}</span>
  ),
}));

vi.mock("@/components/shared/billing/InvoiceStatusBadge", () => ({
  InvoiceStatusBadge: ({ displayStatus }: { displayStatus?: string }) => (
    <span data-testid="invoice-badge">{displayStatus}</span>
  ),
}));

vi.mock("@/components/shared/doctor-display/DoctorIdentityRow", () => ({
  DoctorIdentityRow: ({ doctor }: { doctor: { display_name: string } }) => (
    <span data-testid="doctor-row">{doctor.display_name}</span>
  ),
}));

vi.mock("@/components/shared/CategoryInlineLink", () => ({
  CategoryInlineLink: ({ label }: { label: string }) => (
    <span data-testid="category-link">{label}</span>
  ),
}));

const appt = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "owner-1",
  treating_physician_id: "treat-1",
  patient: "patient-1",
  title: "Annual Check-up",
  start: "2026-06-08T09:00:00.000Z",
  end: "2026-06-08T10:00:00.000Z",
  status: "scheduled",
  location: "Demo Clinic",
  created_at: "2026-06-01T10:00:00.000Z",
  updated_at: null,
  attachments: [],
  category: null,
  notes: null,
  appointment_type_name: "Annual Check-up",
  duration_minutes: 60,
  patient_name: "Jane Doe",
  patient_email: "jane@example.com",
  category_data: { id: "cat-1", label: "General", color: "#0af", icon: "stethoscope" },
  owner_clinician: {
    id: "owner-1",
    display_name: "Dr Owner",
    email: "owner@clinic.com",
    image: null,
    specialty: "GP",
    role: "doctor",
  },
  treating_clinician: {
    id: "treat-1",
    display_name: "Dr Treating",
    email: "treat@clinic.com",
    image: null,
    specialty: "Cardio",
    role: "doctor",
  },
} as AdminPortalAppointmentRow;

describe("AdminPortalAppointmentListRow", () => {
  it("renders patient, category, and clinician embeds", () => {
    const markup = renderToStaticMarkup(<AdminPortalAppointmentListRow appt={appt} />);
    expect(markup).toContain("Jane Doe");
    expect(markup).toContain('data-testid="category-link"');
    expect(markup).toContain("General");
    expect(markup).toContain("Dr Owner");
    expect(markup).toContain("Dr Treating");
  });

  it("renders visit type and invoice badges when provided", () => {
    const markup = renderToStaticMarkup(
      <AdminPortalAppointmentListRow appt={appt} invoiceDisplayStatus="sent" />
    );
    expect(markup).toContain('data-testid="type-badge"');
    expect(markup).toContain("Annual Check-up");
    expect(markup).toContain('data-testid="invoice-badge"');
    expect(markup).toContain("sent");
  });
});
