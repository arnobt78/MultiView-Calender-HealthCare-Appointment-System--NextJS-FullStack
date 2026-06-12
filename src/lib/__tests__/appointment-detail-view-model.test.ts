import { describe, expect, it } from "vitest";
import type { AppointmentDetailRaw } from "@/lib/appointment-access";
import {
  buildAppointmentDetailViewModel,
  formatAppointmentDetailWhenRange,
  mergeAppointmentIntoDetailViewModel,
} from "@/lib/appointment-detail-view-model";
import type { Appointment } from "@/types/types";

const BASE_RAW = {
  id: "appt-1",
  title: "Follow-up",
  start: new Date("2026-06-04T10:00:00Z"),
  end: new Date("2026-06-04T10:30:00Z"),
  status: "pending",
  location: "Room 2",
  owner_id: "owner-1",
  patient_id: "pat-1",
  category_id: null,
  treating_physician_id: "doc-1",
  duration_minutes: 30,
  is_telehealth: false,
  chief_complaint: null,
  notes: null,
  attachments: null,
  patient: {
    id: "pat-1",
    firstname: "Ada",
    lastname: "Lovelace",
    email: "ada@example.com",
    birth_date: null,
    care_level: null,
    clinical_profile: null,
    primary_doctor_id: null,
    primary_doctor_display: null,
    created_at: new Date(),
    updated_at: new Date(),
  },
  category: null,
  assignees: [],
  appointment_type: { name: "Consult", duration_minutes: 30, price_cents: 12000 },
  owner: {
    id: "owner-1",
    email: "owner@clinic.test",
    display_name: "Owner Doc",
    image: null,
    role: "doctor",
    specialty: null,
    consultation_fee: 8000,
  },
  treating_physician: {
    id: "doc-1",
    email: "doc@clinic.test",
    display_name: "Treat Doc",
    image: null,
    role: "doctor",
    specialty: "GP",
    consultation_fee: 9000,
  },
  created_by: {
    id: "admin-1",
    email: "admin@clinic.test",
    display_name: "Demo Admin",
    image: null,
    role: "admin",
  },
  updated_by: {
    id: "admin-1",
    email: "admin@clinic.test",
    display_name: "Demo Admin",
    image: null,
    role: "admin",
  },
} as unknown as AppointmentDetailRaw;

describe("buildAppointmentDetailViewModel", () => {
  it("serializes primary doctor from nested patient.primary_doctor relation", () => {
    const raw = {
      ...BASE_RAW,
      patient: {
        ...BASE_RAW.patient,
        primary_doctor_id: "doc-1",
        primary_doctor: {
          display_name: "Demo Doctor",
          email: "test@doctor.com",
          specialty: "Medicine",
          image: null,
        },
      },
    } as unknown as AppointmentDetailRaw;
    const vm = buildAppointmentDetailViewModel(raw, "patient", "view");
    expect(vm.patient?.primary_doctor_display).toBe("Demo Doctor");
    expect(vm.patient?.primary_doctor_email).toBe("test@doctor.com");
  });

  it("prefers appointment duration and type price for fee label", () => {
    const vm = buildAppointmentDetailViewModel(BASE_RAW, "admin", "view");
    expect(vm.durationMinutes).toBe(30);
    expect(vm.visitFeeCents).toBe(12000);
    expect(vm.visitFeeLabel).toContain("120");
    expect(vm.subtitle).toContain("Ada Lovelace");
    expect(vm.subtitle).toMatch(/–/);
    expect(vm.auditCreatedBy?.label).toBe("Demo Admin");
    expect(vm.auditCreatedBy?.role).toBe("admin");
    expect(vm.auditUpdatedBy?.label).toBe("Demo Admin");
  });

  it("formatAppointmentDetailWhenRange includes end time", () => {
    const label = formatAppointmentDetailWhenRange({
      start: "2026-05-28T09:00:00.000Z",
      end: "2026-05-28T09:30:00.000Z",
    } as Appointment);
    expect(label).toContain("–");
    expect(label).toMatch(/\d{1,2}:\d{2}/);
  });

  it("falls back to start/end delta when duration_minutes unset", () => {
    const raw = {
      ...BASE_RAW,
      duration_minutes: null,
      appointment_type: null,
    } as unknown as AppointmentDetailRaw;
    const vm = buildAppointmentDetailViewModel(raw, "doctor", "mutate");
    expect(vm.durationMinutes).toBe(30);
  });
});

describe("mergeAppointmentIntoDetailViewModel", () => {
  it("updates status and fee from list row", () => {
    const vm = buildAppointmentDetailViewModel(BASE_RAW, "admin", "view");
    const row = {
      ...vm.appointment,
      status: "done",
      appointment_type_price_cents: 15000,
      doctor_consultation_fee_cents: 9000,
    } as Appointment;
    const merged = mergeAppointmentIntoDetailViewModel(vm, row);
    expect(merged.appointment.status).toBe("done");
    expect(merged.visitFeeCents).toBe(15000);
  });
});
