/**
 * Patient detail access — who may open a patient chart outside list UIs.
 *
 * Admin: any patient.
 * Doctor: related patients only (primary doctor OR any appointment they own/treat).
 * Patient: own record (email match).
 */

import { prisma } from "@/lib/prisma";
import { isAdminRole, isDoctorRole, isPatientRole } from "@/lib/rbac";

export type PatientAccessSession = {
  userId: string;
  email: string;
  role: string | null;
};

/** Doctor ↔ patient clinical relationship used for portal + `/patients/:id` gate. */
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

/** Server gate for `/control-panel/patients/:id` and `/patients/:id`. */
export async function canViewPatientDetail(
  session: PatientAccessSession,
  patientId: string
): Promise<boolean> {
  const { role, userId, email } = session;
  if (isAdminRole(role)) return true;
  if (isDoctorRole(role)) return doctorIsRelatedToPatient(userId, patientId);
  if (isPatientRole(role)) return patientOwnsPatientRecord(email, patientId);
  return false;
}
