import { describe, expect, it } from "vitest";
import {
  invoiceAppointmentOptionToDialogDisplay,
  invoiceVisitSummaryToDialogDisplay,
} from "@/lib/invoice-dialog-visit-display";
import type {
  InvoiceAppointmentOptionRow,
  InvoiceVisitSummary,
} from "@/lib/billing-types";

const visitSummary = (): InvoiceVisitSummary => ({
  appointment_id: "a1",
  title: "Follow-up — Cardiology",
  start_iso: "2026-05-28T09:00:00.000Z",
  end_iso: "2026-05-28T09:30:00.000Z",
  when_label: "Wed, 28 May 2026 · 09:00 – 09:30",
  location_label: "Room 1",
  is_telehealth: false,
  patient_id: "p1",
  patient_label: "Demo Patient",
  patient_email: "demo@patient.com",
  patient_birth_date: "1999-01-01T00:00:00.000Z",
  patient_clinical_profile: { image_url: "demo/patient-portrait" },
  patient_care_level: 8,
  appointment_type_name: "Follow-up Visit",
  duration_minutes: 30,
  appointment_type_duration_minutes: 30,
  category_id: "c1",
  category_label: "Cardiology",
  category_color: "#8b5cf6",
  category_icon: "heart",
  treating_physician_id: "d1",
  treating_physician_label: "Dr. Smith",
  treating_physician_email: "smith@clinic.com",
  treating_physician_specialty: "Cardiology",
  treating_physician_image: "/img/smith.jpg",
  treating_physician_role: "doctor",
  calendar_owner_id: "d2",
  calendar_owner_label: "Dr. Jones",
  calendar_owner_email: "jones@clinic.com",
  calendar_owner_specialty: "General",
  calendar_owner_image: null,
  calendar_owner_role: "doctor",
  appointment_type_price_cents: 12000,
  doctor_consultation_fee_cents: 15000,
});

describe("invoiceVisitSummaryToDialogDisplay", () => {
  it("maps portrait, care tier, type+duration, doctors, and fee input", () => {
    const display = invoiceVisitSummaryToDialogDisplay(visitSummary());

    expect(display.patientPortrait?.id).toBe("p1");
    expect(display.patientPortrait?.clinical_profile).toEqual({
      image_url: "demo/patient-portrait",
    });
    expect(display.patientCareLevel).toBe(8);
    expect(display.appointmentTypeName).toBe("Follow-up Visit");
    expect(display.typeDurationLabel).toBe("30 min");
    expect(display.treating?.name).toBe("Dr. Smith");
    expect(display.owner?.name).toBe("Dr. Jones");
    expect(display.visitFeeInput).toEqual({
      typePriceCents: 12000,
      doctorConsultationFeeCents: 15000,
    });
  });
});

describe("invoiceAppointmentOptionToDialogDisplay", () => {
  it("omits owner when same as treating physician", () => {
    const option: InvoiceAppointmentOptionRow = {
      id: "a1",
      title: "Visit",
      start: "2026-05-28T09:00:00.000Z",
      end: "2026-05-28T09:30:00.000Z",
      owner_id: "d1",
      patient_label: "Demo Patient",
      eligible: true,
      block_reason: null,
      invoice_id: null,
      invoice_status: null,
      display_status: null,
      amount_cents: null,
      currency: "eur",
      suggested_amount_cents: 12000,
      appointment_type_price_cents: 12000,
      doctor_consultation_fee_cents: 15000,
      treating_physician_id: "d1",
      treating_physician_label: "Dr. Smith",
      calendar_owner_id: "d1",
      calendar_owner_label: "Dr. Smith",
      appointment_type_name: "Consult",
      duration_minutes: 20,
    };

    const display = invoiceAppointmentOptionToDialogDisplay(option);
    expect(display.treating?.id).toBe("d1");
    expect(display.owner).toBeNull();
    expect(display.typeDurationLabel).toBe("20 min");
  });
});
