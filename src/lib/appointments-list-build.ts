/**
 * Shared calendar appointment list join — used by useAppointments (client) and
 * prefetchDashboardAppointments (SSR) so both paths produce identical FullAppointment[].
 */

import type { FullAppointment } from "@/hooks/useAppointments";
import {
  attachPortalStaffToFullAppointment,
  isPortalSerializedAppointmentRow,
} from "@/lib/portal-appointment";
import type { PortalAppointmentRow } from "@/lib/serializers";
import { isPatientRole } from "@/lib/rbac";
import type {
  Appointment,
  AppointmentAssignee,
  Category,
  Patient,
} from "@/types/types";

export type BuildFullAppointmentsListInput = {
  userId: string;
  userEmail?: string | null;
  userRole: string;
  categories: Category[];
  patients: Patient[];
  assignees: AppointmentAssignee[];
  /** Rows from GET /api/appointments (owned or patient-scoped). */
  ownedAppointments: Appointment[];
  /** Extra rows fetched for accepted assignee participation (not in owned list). */
  assignedAppointmentRows: Appointment[];
};

/**
 * Mirrors the join/dedupe logic in useAppointments queryFn — keep in sync when changing calendar data shape.
 */
export function buildFullAppointmentsList(
  input: BuildFullAppointmentsListInput
): FullAppointment[] {
  const {
    userId,
    userEmail,
    userRole,
    categories,
    patients,
    assignees,
    ownedAppointments,
    assignedAppointmentRows,
  } = input;

  const patientViewer = isPatientRole(userRole);

  const ownedWithDetails: FullAppointment[] = ownedAppointments.map((appt) => {
    const assigneesForAppt = assignees.filter((a) => a.appointment === appt.id);
    const patientRow = patients.find((p) => p.id === appt.patient);

    if (
      patientViewer &&
      isPortalSerializedAppointmentRow(appt as unknown as Record<string, unknown>)
    ) {
      return attachPortalStaffToFullAppointment(appt as PortalAppointmentRow, {
        patient_data: patientRow,
        appointment_assignee: assigneesForAppt,
      });
    }

    return {
      ...appt,
      category_data:
        (appt as FullAppointment).category_data ??
        categories.find((c) => c.id === appt.category),
      patient_data: patientRow,
      appointment_assignee: assigneesForAppt,
    };
  });

  const assignedByUser = assignees.filter(
    (a) => a.user === userId && a.status === "accepted"
  );
  const assignedByEmail = userEmail
    ? assignees.filter((a) => a.invited_email === userEmail && a.status === "accepted")
    : [];

  const assignedAppointments: FullAppointment[] = assignedAppointmentRows
    .filter((a): a is Appointment => a !== null && !!a.id)
    .map((appt) => {
      const relatedAssignees = [
        ...assignedByUser.filter((a) => a.appointment === appt.id),
        ...assignedByEmail.filter((a) => a.appointment === appt.id),
      ].filter(
        (a) =>
          typeof a.permission === "string" &&
          ["read", "write", "full"].includes(a.permission)
      );

      return {
        ...appt,
        category_data: categories.find((c) => c.id === appt.category),
        patient_data: patients.find((p) => p.id === appt.patient),
        appointment_assignee: relatedAssignees,
      };
    });

  const allAppointments = [...ownedWithDetails, ...assignedAppointments];

  return allAppointments.reduce((acc: FullAppointment[], curr) => {
    if (!curr || !curr.id) return acc;
    const existing = acc.find((a) => a.id === curr.id);
    if (existing) {
      existing.appointment_assignee = [
        ...(existing.appointment_assignee || []),
        ...(curr.appointment_assignee || []),
      ].filter((v, i, arr) => v && v.id && arr.findIndex((b) => b.id === v.id) === i);
    } else {
      acc.push({ ...curr });
    }
    return acc;
  }, []);
}
