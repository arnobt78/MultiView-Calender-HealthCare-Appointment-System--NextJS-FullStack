import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DoctorPortalAppointmentListRow } from "@/components/shared/appointments/DoctorPortalAppointmentListRow";
import type { DoctorPortalAppointmentRow } from "@/types/types";

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

const appt = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "user-1",
  title: "Annual Check-up",
  start: "2026-06-08T09:00:00.000Z",
  end: "2026-06-08T10:00:00.000Z",
  status: "scheduled",
  location: "Demo Clinic",
  created_at: "2026-06-01T10:00:00.000Z",
  updated_at: null,
  patient: null,
  attachments: [],
  category: null,
  notes: null,
  appointment_type_name: "Annual Check-up",
  duration_minutes: 60,
} as DoctorPortalAppointmentRow;

describe("DoctorPortalAppointmentListRow", () => {
  it("renders visit type badge when appointment_type_name is set", () => {
    const markup = renderToStaticMarkup(
      <DoctorPortalAppointmentListRow appt={appt} variant="today" />
    );
    expect(markup).toContain('data-testid="type-badge"');
    expect(markup).toContain("Annual Check-up");
  });
});
