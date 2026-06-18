import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { InvoiceLinkedVisitPanel } from "@/components/shared/billing/InvoiceLinkedVisitPanel";
import type { InvoiceVisitSummary } from "@/lib/billing-types";
import { APPOINTMENT_DETAIL_PORTAL_DOCTOR_LINKS } from "@/lib/entity-detail-snapshot-links";

vi.mock("@/components/shared/EntityTitleLink", () => ({
  EntityTitleLink: ({ label }: { label: string }) => <span>{label}</span>,
}));

vi.mock("@/components/shared/PrefetchingLink", () => ({
  PrefetchingLink: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

vi.mock("@/components/shared/person-display/PatientIdentityCell", () => ({
  PatientIdentityCell: ({
    linkPatient,
    href,
  }: {
    linkPatient: boolean;
    href?: string;
  }) => (
    <span data-testid="patient-cell" data-link-patient={String(linkPatient)} data-href={href ?? ""}>
      Patient
    </span>
  ),
}));

vi.mock("@/components/shared/person-display/DoctorIdentityCell", () => ({
  DoctorIdentityCell: () => <span>Doctor</span>,
}));

vi.mock("@/components/control-panel/patient-detail-snapshot-columns", () => ({
  CategoryTableCell: () => <span>Category</span>,
}));

vi.mock("@/components/shared/appointments/TelehealthSessionBadge", () => ({
  TelehealthSessionBadge: () => <span data-testid="telehealth-badge">Telehealth</span>,
}));

vi.mock("@/components/shared/appointment-display/AppointmentTypeGlassBadge", () => ({
  AppointmentTypeGlassBadge: ({ name }: { name: string }) => (
    <span data-testid="type-badge">{name}</span>
  ),
}));

const summary = {
  when_label: "Mon, 08 Jun 2026 · 13:00 - 13:30",
  is_telehealth: true,
  location_label: "Video call (telehealth)",
  patient_label: "Maria Schmidt",
  patient_id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  appointment_type_name: "Telehealth Session",
  duration_minutes: 30,
} as InvoiceVisitSummary;

describe("InvoiceLinkedVisitPanel", () => {
  it("renders telehealth badge inline with when label", () => {
    const markup = renderToStaticMarkup(
      <InvoiceLinkedVisitPanel
        summary={summary}
        appointmentHref="/appointments/a"
        patientHref={null}
        viewerRole="doctor"
        visitTitle="Telehealth Session — Maria Schmidt"
      />
    );
    expect(markup).toContain("Mon, 08 Jun 2026");
    expect(markup).toContain('data-testid="telehealth-badge"');
    expect(markup).toContain('data-testid="type-badge"');
    expect(markup).toContain("Telehealth Session");
    expect(markup).toContain("flex-wrap items-center");
    expect(markup).not.toContain("mt-1 block");
  });

  it("doctor portal patient row links when appointment-detail policy is used", () => {
    const markup = renderToStaticMarkup(
      <InvoiceLinkedVisitPanel
        summary={summary}
        appointmentHref="/appointments/a"
        patientHref="/patients/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
        viewerRole="doctor"
        visitTitle="Telehealth Session — Maria Schmidt"
        linkPolicy={APPOINTMENT_DETAIL_PORTAL_DOCTOR_LINKS}
      />
    );
    expect(markup).toContain('data-link-patient="true"');
    expect(markup).toContain('data-href="/patients/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"');
  });
});
