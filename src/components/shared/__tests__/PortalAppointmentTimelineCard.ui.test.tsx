import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PortalAppointmentTimelineCard } from "@/components/shared/PortalAppointmentTimelineCard";
import type { PortalAppointmentRow } from "@/lib/serializers";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { role: "patient" } }),
}));

vi.mock("@/context/AppointmentColorContext", () => ({
  useAppointmentColor: () => ({
    getAppointmentColorToken: () => ({
      cardBgColor: "#fff",
      cardBorderColor: "#ccc",
      lineColor: "#000",
    }),
  }),
}));

vi.mock("@/components/shared/RoleEntityLink", () => ({
  RoleEntityLink: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock("@/components/shared/appointment-display/AppointmentCategoryTypeMetaRow", () => ({
  AppointmentCategoryTypeMetaRow: ({
    timeRangeLabel,
    appointment,
  }: {
    timeRangeLabel?: string | null;
    appointment: { appointment_type_name?: string | null };
  }) => (
    <span data-testid="category-meta">
      {appointment.appointment_type_name}
      {timeRangeLabel ? ` · ${timeRangeLabel}` : ""}
    </span>
  ),
}));

vi.mock("@/components/shared/PortalClinicianLink", () => ({
  PortalClinicianLink: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock("@/components/shared/doctor-display/DoctorAvatar", () => ({
  DoctorAvatar: () => <span data-testid="avatar" />,
}));

const appointment = {
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
  category: "cat-1",
  notes: null,
  appointment_type_name: "Annual Check-up",
  duration_minutes: 60,
  category_data: {
    id: "cat-1",
    label: "General",
    color: "#f59e0b",
    icon: "Sun",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: null,
    description: null,
  },
  owner: {
    id: "admin-1",
    display_name: "Demo Admin",
    email: "test@admin.com",
    role: "admin",
    image: null,
    specialty: null,
    office_location: null,
  },
} as unknown as PortalAppointmentRow;

describe("PortalAppointmentTimelineCard", () => {
  it("omits duplicate timeRangeLabel on category row", () => {
    const markup = renderToStaticMarkup(
      <PortalAppointmentTimelineCard appointment={appointment} />
    );
    expect(markup).toContain('data-testid="category-meta"');
    expect(markup).toContain("Annual Check-up");
    expect(markup).not.toContain("09:00");
    expect(markup).toContain("08 Jun 2026");
  });

  it("shows Admin badge on calendar owner row", () => {
    const markup = renderToStaticMarkup(
      <PortalAppointmentTimelineCard appointment={appointment} />
    );
    expect(markup).toContain("Calendar owner:");
    expect(markup).toContain("Demo Admin");
    expect(markup).toContain("Admin");
  });
});
