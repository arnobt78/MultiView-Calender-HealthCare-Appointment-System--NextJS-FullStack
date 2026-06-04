/**
 * Maps Prisma appointment rows (with snapshot joins) → `AppointmentSnapshotRow`.
 * Shared by patient + category snapshot loaders and API routes.
 */
import { resolveTreatingPhysicianUserId } from "@/lib/appointment-display-doctor";
import { serializeAppointment } from "@/lib/serializers";
import type { AppointmentSnapshotRow, Patient } from "@/types/types";

type SnapshotUserPick = {
  id: string;
  display_name: string | null;
  email: string;
  specialty?: string | null;
  image?: string | null;
  /** consultation_fee → doctor_consultation_fee_cents on serialized snapshot row */
  consultation_fee?: number | null;
};

type SnapshotPatientPick = {
  id: string;
  firstname: string;
  lastname: string;
  email: string | null;
  birth_date: Date | null;
  clinical_profile?: Patient["clinical_profile"];
};

export type AppointmentSnapshotPrismaRow = Parameters<typeof serializeAppointment>[0] & {
  category?: {
    label: string | null;
    color: string | null;
    icon: string | null;
  } | null;
  appointment_type?: { name: string; price_cents?: number } | null;
  owner?: SnapshotUserPick | null;
  treating_physician?: SnapshotUserPick | null;
  patient?: SnapshotPatientPick | null;
};

export function mapAppointmentToSnapshotRow(
  row: AppointmentSnapshotPrismaRow
): AppointmentSnapshotRow {
  const feeDoc = row.treating_physician ?? row.owner;
  const serialized = serializeAppointment({
    ...row,
    appointment_type_price_cents: row.appointment_type?.price_cents ?? null,
    doctor_consultation_fee_cents: feeDoc?.consultation_fee ?? null,
  });
  const clinicalId = resolveTreatingPhysicianUserId(serialized);
  const clinical =
    row.treating_physician_id && row.treating_physician?.id === clinicalId
      ? row.treating_physician
      : row.owner;

  const patient = row.patient;

  return {
    ...serialized,
    category_label: row.category?.label ?? null,
    category_color: row.category?.color ?? null,
    category_icon: row.category?.icon ?? null,
    appointment_type_name: row.appointment_type?.name ?? null,
    calendar_owner_id: row.owner?.id ?? null,
    calendar_owner_display: row.owner?.display_name ?? null,
    calendar_owner_email: row.owner?.email ?? null,
    calendar_owner_image: row.owner?.image ?? null,
    doctor_id: clinical?.id ?? null,
    doctor_display: clinical?.display_name ?? null,
    doctor_email: clinical?.email ?? null,
    doctor_specialty: clinical?.specialty ?? null,
    doctor_image: clinical?.image ?? null,
    patient_firstname: patient?.firstname ?? null,
    patient_lastname: patient?.lastname ?? null,
    patient_email: patient?.email ?? null,
    patient_birth_date: patient?.birth_date?.toISOString?.() ?? null,
    patient_clinical_profile:
      (patient?.clinical_profile as Patient["clinical_profile"] | undefined) ?? null,
  };
}

/** Prisma `include` for category/patient snapshot appointment queries. */
export const appointmentSnapshotInclude = {
  category: true,
  appointment_type: { select: { name: true, price_cents: true } },
  owner: {
    select: {
      id: true,
      display_name: true,
      email: true,
      specialty: true,
      image: true,
      /** consultation_fee → doctor_consultation_fee_cents on snapshot row */
      consultation_fee: true,
    },
  },
  treating_physician: {
    select: {
      id: true,
      display_name: true,
      email: true,
      specialty: true,
      image: true,
      /** consultation_fee → doctor_consultation_fee_cents on snapshot row */
      consultation_fee: true,
    },
  },
  patient: {
    select: {
      id: true,
      firstname: true,
      lastname: true,
      email: true,
      birth_date: true,
      clinical_profile: true,
    },
  },
} as const;
