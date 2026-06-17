/**
 * Appointment dialog assignee mutations — POST/DELETE + client row enrichment for patient picker UI.
 * Server rows may store `user_id` null for patients; `user` on client holds patient id when known.
 */
import { apiClient } from "@/lib/api-client";
import type { AppointmentAssignee, Patient } from "@/types/types";

export async function fetchAppointmentAssigneesForDialog(
  appointmentId: string
): Promise<AppointmentAssignee[]> {
  const res = await apiClient<{ assignees: AppointmentAssignee[] }>(
    `/api/appointments/${encodeURIComponent(appointmentId)}/assignees`
  );
  return res.assignees ?? [];
}

/** Resolve patient id on assignee rows for `AppointmentDialogAssigneesSection` chips. */
export function enrichAssigneesWithPatientIds(
  rows: AppointmentAssignee[],
  patients: Patient[],
  seed?: AppointmentAssignee[]
): AppointmentAssignee[] {
  return rows.map((row) => {
    if (row.user) return row;
    const email = row.invited_email?.trim().toLowerCase();
    if (!email) {
      const fromSeed = seed?.find((s) => s.id === row.id);
      return fromSeed ?? row;
    }
    const patient = patients.find((p) => p.email?.trim().toLowerCase() === email);
    return patient ? { ...row, user: patient.id, user_type: "patients" } : row;
  });
}

export async function addPatientAssigneeToAppointment(
  appointmentId: string,
  patientId: string,
  patientEmail: string | null | undefined
): Promise<void> {
  await apiClient(`/api/appointments/${encodeURIComponent(appointmentId)}/assignees`, {
    method: "POST",
    body: JSON.stringify({
      assignees: [
        {
          user_type: "patients",
          user: patientId,
          invited_email: patientEmail ?? undefined,
          status: "pending",
          permission: "read",
        },
      ],
    }),
  });
}

/** Single-row remove — route param is assignee id (see `/api/appointments/[id]/permissions`). */
export async function removeAppointmentAssignee(assigneeId: string): Promise<void> {
  await apiClient(`/api/appointments/${encodeURIComponent(assigneeId)}/permissions`, {
    method: "DELETE",
  });
}
