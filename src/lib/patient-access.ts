/**
 * Patient detail access — view vs mutate (SSR pages + REST + PatientDetailScreen).
 *
 * View: admin any; doctor related or roster browse; patient own email.
 * Mutate: admin any; doctor only when primary_doctor_id === viewer (not merely related).
 */

import { prisma } from "@/lib/prisma";
import { isValidUUID } from "@/lib/validation";
import { isAdminRole, isDoctorRole, isPatientRole } from "@/lib/rbac";

export type PatientAccessLevel = "none" | "view" | "mutate";

export type PatientAccessSession = {
  userId: string;
  email: string;
  role: string | null;
};

export type ResolvePatientAccessOptions = {
  /** When set, allows view if patient.primary_doctor_id matches (directory from `/doctors/:id`). */
  rosterDoctorId?: string | null;
};

type PatientAccessRow = {
  id: string;
  email: string | null;
  primary_doctor_id: string | null;
};

async function loadPatientAccessRow(patientId: string): Promise<PatientAccessRow | null> {
  return prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, email: true, primary_doctor_id: true },
  });
}

/** Doctor ↔ patient clinical relationship used for portal + `/patients/:id` view gate. */
export async function doctorIsRelatedToPatient(
  doctorId: string,
  patientId: string
): Promise<boolean> {
  const row = await prisma.patient.findFirst({
    where: {
      id: patientId,
      OR: [
        { primary_doctor_id: doctorId },
        {
          appointments: {
            some: {
              OR: [{ owner_id: doctorId }, { treating_physician_id: doctorId }],
            },
          },
        },
      ],
    },
    select: { id: true },
  });
  return row != null;
}

/** Patient role may only open their own chart (matched by account email). */
export async function patientOwnsPatientRecord(
  email: string,
  patientId: string
): Promise<boolean> {
  const row = await prisma.patient.findFirst({
    where: { id: patientId, email },
    select: { id: true },
  });
  return row != null;
}

async function canViewPatientRow(
  session: PatientAccessSession,
  row: PatientAccessRow,
  options?: ResolvePatientAccessOptions
): Promise<boolean> {
  const { role, userId, email } = session;
  if (isAdminRole(role)) return true;
  if (isPatientRole(role)) {
    return row.email != null && row.email === email;
  }
  if (isDoctorRole(role)) {
    if (await doctorIsRelatedToPatient(userId, row.id)) return true;
    const rosterId = options?.rosterDoctorId;
    if (
      rosterId &&
      isValidUUID(rosterId) &&
      row.primary_doctor_id === rosterId
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Single resolver for patient chart access — mirrors `resolveAppointmentAccess`.
 */
export async function resolvePatientAccess(
  session: PatientAccessSession,
  patientId: string,
  options?: ResolvePatientAccessOptions
): Promise<PatientAccessLevel> {
  if (!isValidUUID(patientId)) return "none";

  const row = await loadPatientAccessRow(patientId);
  if (!row) return "none";

  const canView = await canViewPatientRow(session, row, options);
  if (!canView) return "none";

  const { role, userId } = session;
  if (isAdminRole(role)) return "mutate";
  if (isDoctorRole(role) && row.primary_doctor_id === userId) return "mutate";
  return "view";
}

/** Server gate for `/control-panel/patients/:id` and `/patients/:id` (view or mutate). */
export async function canViewPatientDetail(
  session: PatientAccessSession,
  patientId: string,
  options?: ResolvePatientAccessOptions
): Promise<boolean> {
  const level = await resolvePatientAccess(session, patientId, options);
  return level !== "none";
}
