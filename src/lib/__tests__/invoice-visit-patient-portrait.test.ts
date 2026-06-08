import { describe, expect, it } from "vitest";
import { invoiceVisitSummaryToPatientPortrait } from "@/lib/invoice-visit-patient-portrait";
import type { InvoiceVisitSummary } from "@/lib/billing-types";

const baseSummary = (): InvoiceVisitSummary => ({
  appointment_id: "appt-1",
  title: "Visit",
  start_iso: "2026-05-09T15:00:00.000Z",
  end_iso: "2026-05-09T15:45:00.000Z",
  when_label: "Sat, 09 May 2026 · 17:00 – 17:45",
  location_label: "Room A",
  is_telehealth: false,
  patient_id: "patient-1",
  patient_label: "Thomas Weber",
  patient_email: "thomas@example.com",
  patient_birth_date: "1970-01-01T00:00:00.000Z",
  patient_clinical_profile: { image_url: "demo/patient-portrait" },
  patient_care_level: 8,
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
});

describe("invoiceVisitSummaryToPatientPortrait", () => {
  it("maps clinical_profile and name parts from visit_summary", () => {
    const portrait = invoiceVisitSummaryToPatientPortrait(baseSummary());
    expect(portrait).toEqual({
      id: "patient-1",
      email: "thomas@example.com",
      clinical_profile: { image_url: "demo/patient-portrait" },
      birth_date: "1970-01-01T00:00:00.000Z",
      firstname: "Thomas",
      lastname: "Weber",
    });
  });

  it("returns null when patient_id missing", () => {
    expect(
      invoiceVisitSummaryToPatientPortrait({ ...baseSummary(), patient_id: null })
    ).toBeNull();
  });
});
