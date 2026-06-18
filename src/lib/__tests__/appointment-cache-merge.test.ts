import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { FullAppointment } from "@/hooks/useAppointments";
import {
  enrichAppointmentToFullRow,
  mergeAppointmentIntoAllCaches,
  removeAppointmentFromListCache,
  upsertAppointmentInList,
} from "@/lib/appointment-cache-merge";
import type { AppointmentDetailViewModel } from "@/lib/appointment-detail-view-model";
import type { Category, Patient } from "@/types/types";

const APPT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const baseRow: FullAppointment = {
  id: APPT_ID,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: null,
  title: "Visit",
  start: "2026-06-04T10:00:00.000Z",
  end: "2026-06-04T10:30:00.000Z",
  status: "pending",
  user_id: "owner-1",
  patient: "pat-1",
  category: "cat-1",
  location: null,
  notes: null,
  attachments: [],
  is_telehealth: false,
  appointment_assignee: [
    {
      id: "asg-1",
      created_at: "2026-01-01T00:00:00.000Z",
      appointment: APPT_ID,
      user: "u1",
      user_type: "patients",
      status: "accepted",
    },
  ],
};

const detail: AppointmentDetailViewModel = {
  appointmentId: APPT_ID,
  accessLevel: "view",
  viewerRole: "doctor",
  appointment: baseRow,
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
  auditCreatedBy: null,
  auditUpdatedBy: null,
};

describe("appointment-cache-merge", () => {
  it("upsertAppointmentInList replaces existing row", () => {
    const updated = { ...baseRow, title: "Updated" };
    const next = upsertAppointmentInList([baseRow], updated);
    expect(next).toHaveLength(1);
    expect(next[0]?.title).toBe("Updated");
  });

  it("upsertAppointmentInList appends new row", () => {
    const other = { ...baseRow, id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb" };
    const next = upsertAppointmentInList([baseRow], other);
    expect(next).toHaveLength(2);
  });

  it("enrichAppointmentToFullRow preserves assignees and resolves patient FK", () => {
    const qc = new QueryClient();
    const patient: Patient = {
      id: "pat-2",
      firstname: "Jane",
      lastname: "Doe",
      email: "j@example.com",
      birth_date: null,
      care_level: null,
      pronoun: null,
      active: true,
      active_since: null,
      clinical_profile: null,
      created_at: "2026-01-01T00:00:00.000Z",
    };
    qc.setQueryData(queryKeys.patients.all, [patient]);

    const row = enrichAppointmentToFullRow(
      qc,
      { ...baseRow, patient: "pat-2" },
      baseRow
    );
    expect(row.appointment_assignee).toHaveLength(1);
    expect(row.patient_data?.id).toBe("pat-2");
  });

  it("mergeAppointmentIntoAllCaches patches list and detail", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.appointments.all, [baseRow]);
    const nextDetail = {
      ...detail,
      appointment: { ...detail.appointment, status: "done" as const },
    };
    mergeAppointmentIntoAllCaches(qc, {
      appointment: { ...baseRow, status: "done" },
      detail: nextDetail,
    });
    const list = qc.getQueryData<FullAppointment[]>(queryKeys.appointments.all);
    expect(list?.[0]?.status).toBe("done");
    expect(
      (qc.getQueryData(queryKeys.appointments.detail(APPT_ID)) as AppointmentDetailViewModel)
        .appointment.status
    ).toBe("done");
  });

  it("removeAppointmentFromListCache drops list row and detail query", () => {
    const qc = new QueryClient();
    qc.setQueryData(queryKeys.appointments.all, [baseRow]);
    qc.setQueryData(queryKeys.appointments.detail(APPT_ID), detail);
    removeAppointmentFromListCache(qc, APPT_ID);
    expect(qc.getQueryData(queryKeys.appointments.all)).toEqual([]);
    expect(qc.getQueryData(queryKeys.appointments.detail(APPT_ID))).toBeUndefined();
  });

  it("enrichAppointmentToFullRow resolves category from categories.all", () => {
    const qc = new QueryClient();
    const category: Category = {
      id: "cat-2",
      label: "Follow-up",
      description: null,
      color: "#fff",
      icon: null,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: null,
    };
    qc.setQueryData(queryKeys.categories.all, [category]);
    const row = enrichAppointmentToFullRow(qc, { ...baseRow, category: "cat-2" }, baseRow);
    expect(row.category_data?.label).toBe("Follow-up");
  });
});
