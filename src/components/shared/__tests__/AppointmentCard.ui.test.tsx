import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AppointmentCard } from "@/components/shared/AppointmentCard";
import type { FullAppointment } from "@/hooks/useAppointments";
import type { OwnerUserSummary } from "@/hooks/useOwnerUserSummaries";

let mockModel: Record<string, unknown>;

vi.mock("@/hooks/useAppointmentCardModel", () => ({
  useAppointmentCardModel: () => mockModel,
}));

vi.mock("@/components/shared/AppointmentActionsMenu", () => ({
  AppointmentActionsMenu: () => <button type="button">menu</button>,
}));

vi.mock("@/components/shared/AppointmentTitleRow", () => ({
  AppointmentTitleRow: () => <span>title</span>,
}));

vi.mock("@/components/shared/AppointmentListColorBar", () => ({
  AppointmentListColorBar: () => <span>bar</span>,
}));

vi.mock("@/components/shared/RoleEntityLink", () => ({
  RoleEntityLink: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock("@/components/shared/PortalStaffLink", () => ({
  PortalStaffLink: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock("@/components/shared/doctor-display/DoctorAvatar", () => ({
  DoctorAvatar: () => <span>doctor-avatar</span>,
}));

vi.mock("@/components/shared/person-display/PatientPortraitAvatar", () => ({
  PatientPortraitAvatar: () => <span>patient-avatar</span>,
}));

vi.mock("@/components/shared/person-display/PatientAgeGlassBadge", () => ({
  PatientAgeGlassBadge: ({ age }: { age: number }) => <span>{`AGE:${age}`}</span>,
}));

vi.mock("@/components/shared/person-display/PatientCareTierGlassBadge", () => ({
  PatientCareTierGlassBadge: ({ careLevel }: { careLevel: number | null | undefined }) => (
    <span>{`CARE:${careLevel ?? "none"}`}</span>
  ),
}));

vi.mock("@/components/shared/UserAvatar", () => ({
  UserAvatar: () => <span>user-avatar</span>,
}));

vi.mock("@/components/shared/doctor-display/DoctorSpecialtyBadge", () => ({
  DoctorSpecialtyBadge: ({ specialty }: { specialty: string }) => (
    <span>{`SPECIALTY:${specialty}`}</span>
  ),
}));

const appointment: FullAppointment = {
  id: "appt-1",
  created_at: "2026-05-21T09:45:00.000Z",
  updated_at: null,
  start: "2026-05-21T09:45:00.000Z",
  end: "2026-05-21T10:30:00.000Z",
  location: "Berlin",
  patient: "patient-1",
  attachments: [],
  category: "cat-1",
  category_data: {
    id: "cat-1",
    created_at: "2026-05-01T00:00:00.000Z",
    updated_at: null,
    label: "Test",
    description: null,
    color: "#6366f1",
    icon: null,
  },
  notes: "test note",
  title: "Testing",
  status: "pending",
  user_id: "owner-1",
  treating_physician_id: "treating-1",
  patient_data: {
    id: "patient-1",
    firstname: "Demo",
    lastname: "Patient",
    birth_date: "2000-01-01",
    care_level: 7,
    pronoun: null,
    email: "patient@example.com",
    active: true,
    active_since: null,
    created_at: "2026-05-01T00:00:00.000Z",
    primary_doctor_id: "primary-1",
    primary_doctor_display: "Primary Doctor",
    primary_doctor_email: "primary@example.com",
    primary_doctor_specialty: "Neurology",
  },
  appointment_assignee: [],
};

const ownerUsers: OwnerUserSummary[] = [
  {
    id: "owner-1",
    email: "owner@example.com",
    display_name: "Owner Doctor",
    specialty: "Cardiology",
    image: null,
  },
  {
    id: "treating-1",
    email: "treating@example.com",
    display_name: "Treating Doctor",
    specialty: "Dermatology",
    image: null,
  },
  {
    id: "primary-1",
    email: "primary@example.com",
    display_name: "Primary Doctor",
    specialty: "Neurology",
    image: null,
  },
];

function renderCard(variant: "list" | "month-panel" | "popover") {
  return renderToStaticMarkup(
    <AppointmentCard
      variant={variant}
      appointment={appointment}
      patients={appointment.patient_data ? [appointment.patient_data] : []}
      assignees={[]}
      ownerUsers={ownerUsers}
      onEdit={() => {}}
      onDelete={() => {}}
      onToggleStatus={() => {}}
    />
  );
}

describe("AppointmentCard identity layout", () => {
  beforeEach(() => {
    mockModel = {
      isDone: false,
      density: "full",
      colorToken: {
        cardSurfaceColor: "#fff",
        cardBorderColor: "#ddd",
        cardBgColor: "#fff",
        lineColor: "#6366f1",
      },
      start: new Date("2026-05-21T09:45:00.000Z"),
      end: new Date("2026-05-21T10:30:00.000Z"),
      formattedDate: "21.05.2026",
      formattedTime: "09:45 – 10:30",
      statusClass: "text-amber-600",
      patientLabel: "Demo Patient",
      patientId: "patient-1",
      ownerLabel: "Owner Doctor (owner@example.com)",
      dedupedAssignees: [],
      calendarOwnerId: "owner-1",
      treatingPhysicianId: "treating-1",
      treatingDiffersFromOwner: true,
      treatingPhysicianLabel: "Treating Doctor (treating@example.com)",
      primaryDoctorId: "primary-1",
      primaryDoctorLabel: "Primary Doctor (primary@example.com)",
      referralLabel: null,
      user: { id: "staff-1", role: "doctor", email: "staff@example.com" },
      audience: "dashboard",
      portalOwner: null,
      portalTreating: null,
      capabilities: {
        canToggleStatus: true,
        canEdit: true,
        canDelete: true,
      },
    };
  });

  it("keeps popover/month-panel identity rows stacked", () => {
    const popoverMarkup = renderCard("popover");
    const monthPanelMarkup = renderCard("month-panel");

    expect(popoverMarkup).toContain("flex min-w-0 flex-col gap-1");
    expect(monthPanelMarkup).toContain("flex min-w-0 flex-col gap-1");
    expect(popoverMarkup).toContain("Calendar owner:");
    expect(monthPanelMarkup).toContain("Treating physician:");
    expect(popoverMarkup).not.toContain("Age / Care Tier:");
    expect(monthPanelMarkup).not.toContain("Age / Care Tier:");
    // Client demographics share MetaIdentityBlock second line (same as doctor specialty).
    expect(popoverMarkup).toContain("Client:");
    expect(popoverMarkup).toContain("AGE:");
    expect(monthPanelMarkup).toContain("CARE:7");
  });

  it("keeps list identity rows inline with client demographics after email", () => {
    const listMarkup = renderCard("list");
    expect(listMarkup).toContain("flex min-w-0 w-full flex-wrap items-center");
    expect(listMarkup).toContain("Calendar owner/creator:");
    expect(listMarkup).not.toContain("Age / Care Tier:");
    expect(listMarkup).toContain("Client:");
    expect(listMarkup).toContain("AGE:");
    expect(listMarkup).toContain("CARE:7");
  });

  it("renders specialty badges and bracket email formatting", () => {
    const popoverMarkup = renderCard("popover");
    const listMarkup = renderCard("list");

    expect(popoverMarkup).toContain("SPECIALTY:Cardiology");
    expect(popoverMarkup).toContain("SPECIALTY:Dermatology");
    expect(popoverMarkup).toContain("SPECIALTY:Neurology");

    expect(popoverMarkup).toContain("(owner@example.com)");
    expect(listMarkup).toContain("(patient@example.com)");
    expect(listMarkup).toContain("(primary@example.com)");
  });
});

