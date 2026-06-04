import { describe, expect, it } from "vitest";
import { createQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import {
  patchAppointmentDetailCache,
  seedAppointmentDetailCache,
} from "@/lib/appointment-detail-cache";
import type { AppointmentDetailViewModel } from "@/lib/appointment-detail-view-model";

const MODEL: AppointmentDetailViewModel = {
  appointmentId: "appt-cache-1",
  accessLevel: "view",
  viewerRole: "doctor",
  appointment: {
    id: "appt-cache-1",
    created_at: "2026-06-01T00:00:00.000Z",
    updated_at: null,
    title: "Visit",
    start: "2026-06-04T10:00:00.000Z",
    end: "2026-06-04T10:30:00.000Z",
    status: "pending",
    user_id: "owner-1",
    patient: "pat-1",
    category: null,
    location: null,
    notes: null,
    attachments: [],
    is_telehealth: false,
  },
  patient: null,
  category: null,
  calendarOwner: null,
  treatingPhysician: null,
  assignees: [],
  visitFeeCents: 0,
  visitFeeLabel: "—",
  durationMinutes: 30,
  subtitle: "Visit",
  patientSubtitleLabel: null,
};

describe("appointment detail cache helpers", () => {
  it("seedAppointmentDetailCache writes queryKeys.appointments.detail", () => {
    const qc = createQueryClient();
    seedAppointmentDetailCache(qc, "appt-cache-1", MODEL);
    expect(qc.getQueryData(queryKeys.appointments.detail("appt-cache-1"))).toEqual(MODEL);
  });

  it("patchAppointmentDetailCache replaces detail payload", () => {
    const qc = createQueryClient();
    seedAppointmentDetailCache(qc, "appt-cache-1", MODEL);
    const next = {
      ...MODEL,
      appointment: { ...MODEL.appointment, status: "done" },
    };
    patchAppointmentDetailCache(qc, "appt-cache-1", next);
    expect(
      (qc.getQueryData(queryKeys.appointments.detail("appt-cache-1")) as AppointmentDetailViewModel)
        .appointment.status
    ).toBe("done");
  });
});
