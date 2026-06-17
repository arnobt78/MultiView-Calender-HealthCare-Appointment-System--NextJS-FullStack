import { describe, expect, it } from "vitest";
import { mapAppointmentDetailToBillingOption } from "@/lib/billing-appointment-option-from-detail";
import type { AppointmentDetailViewModel } from "@/lib/appointment-detail-view-model";
import { queryKeys } from "@/lib/query-keys";

const baseDetail = (): AppointmentDetailViewModel => ({
  appointmentId: "appt-1",
  accessLevel: "mutate",
  viewerRole: "admin",
  appointment: {
    id: "appt-1",
    title: "Follow-up",
    start: "2026-06-18T08:30:00.000Z",
    end: "2026-06-18T08:50:00.000Z",
    user_id: "owner-1",
    treating_physician_id: "doc-1",
    status: "pending",
    is_telehealth: true,
    location: "Room 1",
    appointment_type_name: "Consultation",
    appointment_type_price_cents: 8500,
    appointment_type_duration_minutes: 20,
    doctor_consultation_fee_cents: 8500,
  } as AppointmentDetailViewModel["appointment"],
  patient: {
    id: "pat-1",
    firstname: "Demo",
    lastname: "Patient",
    email: "patient@test.com",
    birth_date: "1999-01-01",
    care_level: 5,
    clinical_profile: null,
  } as AppointmentDetailViewModel["patient"],
  category: {
    id: "cat-1",
    label: "Cardiology",
    color: "#fff",
    icon: "heart",
  } as AppointmentDetailViewModel["category"],
  calendarOwner: {
    id: "owner-1",
    display_name: "Demo Admin",
    email: "admin@test.com",
    role: "admin",
    image: null,
    specialty: null,
    consultation_fee: null,
  },
  treatingPhysician: {
    id: "doc-1",
    display_name: "Demo Doctor",
    email: "doctor@test.com",
    role: "doctor",
    image: null,
    specialty: "Medicine",
    consultation_fee: 8500,
  },
  assignees: [],
  visitFeeCents: 8500,
  visitFeeLabel: "€85.00",
  durationMinutes: 20,
  subtitle: "Demo Patient",
  patientSubtitleLabel: "Demo Patient",
  auditCreatedBy: null,
  auditUpdatedBy: null,
});

describe("mapAppointmentDetailToBillingOption", () => {
  it("maps detail view-model to picker row with suggested fee", () => {
    const row = mapAppointmentDetailToBillingOption(baseDetail());
    expect(row.id).toBe("appt-1");
    expect(row.eligible).toBe(true);
    expect(row.suggested_amount_cents).toBe(8500);
    expect(row.is_telehealth).toBe(true);
    expect(row.patient_label).toBe("Demo Patient");
  });

  it("marks ineligible when blocking invoice exists", () => {
    const row = mapAppointmentDetailToBillingOption(baseDetail(), [
      {
        id: "inv-1",
        user_id: "doc-1",
        appointment_id: "appt-1",
        amount: 8500,
        currency: "eur",
        status: "draft",
        created_at: "2026-06-17T12:00:00.000Z",
        payments: [],
      },
    ]);
    expect(row.eligible).toBe(false);
    expect(row.invoice_id).toBe("inv-1");
  });

  it("uses cache key shape matching useBillingAppointmentOptionById", () => {
    const key = queryKeys.billing.appointmentOptions("appt-1", false);
    expect(key).toEqual(["app", "billing", "appointment-options", "appt-1", false]);
  });
});
