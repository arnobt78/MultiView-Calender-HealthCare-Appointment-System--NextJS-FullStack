import type { PatientBookingAppointmentType } from "@/lib/patient-booking-wizard";

/**
 * Merges doctor-owned + enabled global appointment types (same rules as GET /api/appointment-types?doctorId=).
 * Patient booking must filter the raw appointment-types API with `filterBookableTypesForDoctorFromApi`
 * (API returns disabled globals too — doctor portal needs the full list).
 */

/** Default minimum notice when only directory rows are available (full API row includes the field). */
export const PATIENT_BOOKING_DEFAULT_MINIMUM_NOTICE_MINUTES = 60;

export type DoctorBookableTypeRow = {
  id: string;
  name: string;
  duration_minutes: number;
  description?: string | null;
  is_telehealth?: boolean;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  /** True when `user_id` is null on the type row. */
  is_global: boolean;
};

export type DoctorOwnedTypeInput = {
  id: string;
  name: string;
  duration_minutes: number;
  description?: string | null;
  is_telehealth?: boolean;
  buffer_before_minutes?: number;
  buffer_after_minutes?: number;
  slot_interval_minutes?: number;
};

export type GlobalTypeWithConfigs = {
  id: string;
  name: string;
  duration_minutes: number;
  description?: string | null;
  is_telehealth?: boolean;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  doctor_configs: { doctor_id: string; is_enabled: boolean }[];
};

function mapOwnedRow(t: DoctorOwnedTypeInput): DoctorBookableTypeRow {
  return {
    id: t.id,
    name: t.name,
    duration_minutes: t.duration_minutes,
    description: t.description ?? null,
    is_telehealth: t.is_telehealth,
    buffer_before_minutes: t.buffer_before_minutes ?? 0,
    buffer_after_minutes: t.buffer_after_minutes ?? 0,
    slot_interval_minutes: t.slot_interval_minutes ?? 30,
    is_global: false,
  };
}

/** Owned types first, then enabled globals — mirrors patient booking type query ordering. */
export function mergeBookableTypesForDoctor(
  doctorId: string,
  owned: DoctorOwnedTypeInput[],
  globals: GlobalTypeWithConfigs[]
): DoctorBookableTypeRow[] {
  const ownedRows = owned.map(mapOwnedRow);

  const globalRows: DoctorBookableTypeRow[] = [];
  for (const g of globals) {
    const cfg = g.doctor_configs.find((c) => c.doctor_id === doctorId);
    const enabled = cfg?.is_enabled ?? true;
    if (!enabled) continue;
    globalRows.push({
      id: g.id,
      name: g.name,
      duration_minutes: g.duration_minutes,
      description: g.description ?? null,
      is_telehealth: g.is_telehealth,
      buffer_before_minutes: g.buffer_before_minutes,
      buffer_after_minutes: g.buffer_after_minutes,
      slot_interval_minutes: g.slot_interval_minutes,
      is_global: true,
    });
  }

  globalRows.sort((a, b) => a.name.localeCompare(b.name));
  return [...ownedRows, ...globalRows];
}

/** Row shape from `GET /api/appointment-types?doctorId=` (includes disabled globals + `is_enabled`). */
export type AppointmentTypeDoctorApiRow = {
  id: string;
  user_id: string | null;
  name: string;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  minimum_notice_minutes?: number;
  is_enabled?: boolean;
};

/**
 * Keeps doctor-owned types and globals enabled for this doctor (absent config = enabled).
 * Matches `mergeBookableTypesForDoctor` / `resolveDoctorBookableTypes` on `GET /api/doctors`.
 */
export function filterBookableTypesForDoctorFromApi(
  doctorId: string,
  types: AppointmentTypeDoctorApiRow[]
): AppointmentTypeDoctorApiRow[] {
  return types.filter(
    (t) => t.user_id === doctorId || (t.user_id === null && (t.is_enabled ?? true))
  );
}

/** Maps directory `bookable_appointment_types` into patient wizard shape (instant seed from `doctors.all`). */
export function mapDirectoryBookableToPatientBookingType(
  doctorId: string,
  row: {
    id: string;
    name: string;
    duration_minutes: number;
    buffer_before_minutes: number;
    buffer_after_minutes: number;
    slot_interval_minutes: number;
    is_global?: boolean;
  }
): PatientBookingAppointmentType {
  return {
    id: row.id,
    name: row.name,
    duration_minutes: row.duration_minutes,
    buffer_before_minutes: row.buffer_before_minutes,
    buffer_after_minutes: row.buffer_after_minutes,
    slot_interval_minutes: row.slot_interval_minutes,
    minimum_notice_minutes: PATIENT_BOOKING_DEFAULT_MINIMUM_NOTICE_MINUTES,
    user_id: row.is_global === false ? doctorId : null,
  };
}

/** Maps filtered API rows into patient wizard shape (authoritative once query settles). */
export function mapApiBookableToPatientBookingType(
  row: AppointmentTypeDoctorApiRow
): PatientBookingAppointmentType {
  return {
    id: row.id,
    name: row.name,
    duration_minutes: row.duration_minutes,
    buffer_before_minutes: row.buffer_before_minutes,
    buffer_after_minutes: row.buffer_after_minutes,
    slot_interval_minutes: row.slot_interval_minutes,
    minimum_notice_minutes:
      row.minimum_notice_minutes ?? PATIENT_BOOKING_DEFAULT_MINIMUM_NOTICE_MINUTES,
    user_id: row.user_id,
  };
}
