/**
 * Appointment detail access — view vs mutate (single source for SSR pages + REST).
 *
 * View:
 *   - admin: any appointment
 *   - doctor: owner, accepted assignee, treating physician, related patient, or accepted dashboard share to owner
 *   - patient: appointments for their own patient record (email match)
 *
 * Mutate (save/delete/PATCH fields):
 *   - admin/doctor: calendar owner OR accepted assignee with permission write|full
 *   - patient: never on detail page (read-only UI)
 *
 * Assignee = per-appointment invite (read/write/full). Dashboard access = whole-calendar share (view path only).
 */

import { APPOINTMENT_TYPE_CARD_SELECT } from "@/lib/appointment-type-include";
import { prisma } from "@/lib/prisma";
import { isAdminRole, isDoctorRole, isPatientRole } from "@/lib/rbac";
import { doctorIsRelatedToPatient, patientOwnsPatientRecord } from "@/lib/patient-access";

export type AppointmentAccessLevel = "none" | "view" | "mutate";

export type AppointmentAccessSession = {
  userId: string;
  email: string;
  role: string | null;
};

type AssigneeRow = {
  user_id: string | null;
  invited_email: string | null;
  status: string | null;
  permission: string | null;
};

export type AppointmentAccessRow = {
  id: string;
  owner_id: string;
  treating_physician_id: string | null;
  patient_id: string | null;
  assignees: AssigneeRow[];
};

const appointmentDetailInclude = {
  patient: true,
  category: true,
  assignees: {
    include: { user: { select: { id: true, email: true, display_name: true } } },
  },
  appointment_type: { select: APPOINTMENT_TYPE_CARD_SELECT },
  /** consultation_fee feeds doctor_consultation_fee_cents on serialized appointment */
  treating_physician: { select: { consultation_fee: true } },
  owner: { select: { consultation_fee: true } },
} as const;

function isAcceptedAssignee(
  assignees: AssigneeRow[],
  userId: string,
  email: string
): boolean {
  return assignees.some(
    (a) =>
      a.status === "accepted" &&
      (a.user_id === userId || (email.length > 0 && a.invited_email === email))
  );
}

function assigneeCanMutate(
  assignees: AssigneeRow[],
  userId: string,
  email: string
): boolean {
  return assignees.some(
    (a) =>
      a.status === "accepted" &&
      (a.user_id === userId || (email.length > 0 && a.invited_email === email)) &&
      (a.permission === "write" || a.permission === "full")
  );
}

/** Accepted dashboard_access row → may view appointments owned by `ownerUserId`. */
async function hasDashboardViewOfOwner(
  viewerId: string,
  viewerEmail: string,
  ownerUserId: string
): Promise<boolean> {
  const row = await prisma.dashboardAccess.findFirst({
    where: {
      owner_user_id: ownerUserId,
      status: "accepted",
      OR: [{ invited_user_id: viewerId }, { invited_email: viewerEmail }],
    },
    select: { id: true },
  });
  return row != null;
}

/** Pure level from loaded row — call after `findUnique` so API/SSR share logic. */
export async function computeAppointmentAccessLevel(
  session: AppointmentAccessSession,
  row: AppointmentAccessRow
): Promise<AppointmentAccessLevel> {
  const { userId, email, role } = session;
  const assignees = row.assignees ?? [];
  const isOwner = row.owner_id === userId;
  const isTreating = row.treating_physician_id === userId;

  if (isPatientRole(role)) {
    if (!row.patient_id) return "none";
    const owns = await patientOwnsPatientRecord(email, row.patient_id);
    return owns ? "view" : "none";
  }

  const canMutate =
    !isPatientRole(role) && (isOwner || assigneeCanMutate(assignees, userId, email));

  if (isAdminRole(role)) {
    return canMutate ? "mutate" : "view";
  }

  if (isDoctorRole(role)) {
    let canView =
      isOwner ||
      isTreating ||
      isAcceptedAssignee(assignees, userId, email);

    if (!canView && row.patient_id) {
      canView = await doctorIsRelatedToPatient(userId, row.patient_id);
    }
    if (!canView) {
      canView = await hasDashboardViewOfOwner(userId, email, row.owner_id);
    }

    if (!canView) return "none";
    return canMutate ? "mutate" : "view";
  }

  if (isOwner || isAcceptedAssignee(assignees, userId, email)) {
    return canMutate ? "mutate" : "view";
  }

  return "none";
}

export type AppointmentDetailRaw = NonNullable<
  Awaited<ReturnType<typeof fetchAppointmentDetailRow>>
>;

async function fetchAppointmentDetailRow(appointmentId: string) {
  return prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: appointmentDetailInclude,
  });
}

export type ResolvedAppointmentAccess = {
  level: AppointmentAccessLevel;
  raw: AppointmentDetailRaw | null;
};

/** Load appointment + compute access for SSR pages and `/api/appointments/[id]`. */
export async function resolveAppointmentAccess(
  session: AppointmentAccessSession,
  appointmentId: string
): Promise<ResolvedAppointmentAccess> {
  const raw = await fetchAppointmentDetailRow(appointmentId);

  if (!raw) {
    return { level: "none", raw: null };
  }

  const level = await computeAppointmentAccessLevel(session, {
    id: raw.id,
    owner_id: raw.owner_id,
    treating_physician_id: raw.treating_physician_id,
    patient_id: raw.patient_id,
    assignees: raw.assignees.map((a) => ({
      user_id: a.user_id,
      invited_email: a.invited_email,
      status: a.status,
      permission: a.permission,
    })),
  });

  return { level, raw };
}

/** Doctor may open another doctor's profile when they share clinical context (same rules as patient). */
export async function doctorCanViewDoctorProfile(
  viewerDoctorId: string,
  targetDoctorId: string
): Promise<boolean> {
  if (viewerDoctorId === targetDoctorId) return true;
  const shared = await prisma.appointment.findFirst({
    where: {
      OR: [
        { owner_id: viewerDoctorId, treating_physician_id: targetDoctorId },
        { owner_id: targetDoctorId, treating_physician_id: viewerDoctorId },
        {
          owner_id: viewerDoctorId,
          patient: { primary_doctor_id: targetDoctorId },
        },
        {
          owner_id: targetDoctorId,
          patient: { primary_doctor_id: viewerDoctorId },
        },
      ],
    },
    select: { id: true },
  });
  return shared != null;
}
