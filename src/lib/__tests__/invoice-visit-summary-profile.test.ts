import { describe, expect, it } from "vitest";
import { mapAppointmentToInvoiceVisitSummary } from "@/lib/invoice-visit-summary";

describe("mapAppointmentToInvoiceVisitSummary patient_clinical_profile", () => {
  it("maps portrait URL from patient clinical_profile JSON", () => {
    const summary = mapAppointmentToInvoiceVisitSummary({
      id: "a1",
      title: "Follow-up",
      start: new Date("2026-05-28T09:00:00.000Z"),
      end: new Date("2026-05-28T09:30:00.000Z"),
      location: "Room 1",
      is_telehealth: false,
      duration_minutes: 30,
      category: null,
      appointment_type: {
        name: "Follow-up Visit",
        duration_minutes: 30,
        price_cents: 9500,
      },
      patient: {
        id: "p1",
        firstname: "Demo",
        lastname: "Patient",
        email: "test@patient.com",
        birth_date: new Date("1999-01-01"),
        care_level: 10,
        clinical_profile: { image_url: "demo/patient-portrait" },
      },
      owner: {
        id: "o1",
        display_name: "Dr. Owner",
        email: "owner@clinic.com",
        specialty: "GP",
        image: null,
        role: "doctor",
        consultation_fee: 18000,
      },
      treating_physician: {
        id: "t1",
        display_name: "Dr. Treat",
        email: "treat@clinic.com",
        specialty: "Cardiology",
        image: null,
        role: "doctor",
        consultation_fee: 20000,
      },
    });

    expect(summary.patient_clinical_profile).toEqual({ image_url: "demo/patient-portrait" });
    expect(summary.patient_care_level).toBe(10);
    expect(summary.appointment_type_price_cents).toBe(9500);
    expect(summary.doctor_consultation_fee_cents).toBe(20000);
  });

  it("returns null clinical profile when JSON has no image_url", () => {
    const summary = mapAppointmentToInvoiceVisitSummary({
      id: "a2",
      title: "Visit",
      start: new Date("2026-05-28T09:00:00.000Z"),
      end: new Date("2026-05-28T09:30:00.000Z"),
      location: null,
      is_telehealth: false,
      category: null,
      appointment_type: null,
      patient: {
        id: "p1",
        firstname: "Demo",
        lastname: "Patient",
        email: null,
        birth_date: null,
        care_level: null,
        clinical_profile: { notes: "no portrait" },
      },
      owner: null,
      treating_physician: null,
    } as Parameters<typeof mapAppointmentToInvoiceVisitSummary>[0]);

    expect(summary.patient_clinical_profile).toBeNull();
  });
});
