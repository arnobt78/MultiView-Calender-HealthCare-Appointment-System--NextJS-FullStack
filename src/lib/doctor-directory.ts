/**
 * Shared shape for `GET /api/doctors` — `/services`, booking wizard, `queryKeys.doctors.all`.
 */

export type DoctorDirectoryAvailability = {
  weekday: number;
  start_min: number;
  end_min: number;
  timezone?: string;
};

export type DoctorDirectoryAppointmentType = {
  id: string;
  name: string;
  duration_minutes: number;
  description?: string | null;
  is_telehealth?: boolean;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  slot_interval_minutes: number;
  /** Set on `bookable_appointment_types` — global template vs doctor-owned. */
  is_global?: boolean;
  /** Visit fee in cents — drives price badges in the booking dialog and appointment cards. */
  price_cents?: number;
};

/** Mirrors serialized row from `src/app/api/doctors/route.ts`. */
export type DoctorDirectoryRow = {
  id: string;
  email: string;
  display_name: string | null;
  image: string | null;
  specialty: string | null;
  bio?: string | null;
  created_at?: string;
  availabilities: DoctorDirectoryAvailability[];
  /** Doctor-owned only — `/services` “N types” stat. */
  appointment_types: DoctorDirectoryAppointmentType[];
  /** Owned + enabled globals — patient booking picker chips (mirrors `GET /api/appointment-types?doctorId=`). */
  bookable_appointment_types: DoctorDirectoryAppointmentType[];
  patient_count?: number;
  /** Doctor account active — lists show all; booking selects partition inactive. */
  is_active?: boolean;
  active_since?: string | null;
  /** All-time paid invoice revenue (cents) — `Invoice.user_id` = doctor. */
  paid_revenue_cents?: number;
};

export type DoctorsDirectoryResponse = {
  doctors: DoctorDirectoryRow[];
};

/** Prefer server-merged bookable list; never treat empty array as “missing”. */
export function resolveDoctorBookableTypes(
  doctor: Pick<DoctorDirectoryRow, "bookable_appointment_types" | "appointment_types">
): DoctorDirectoryAppointmentType[] {
  if (doctor.bookable_appointment_types != null) {
    return doctor.bookable_appointment_types;
  }
  return doctor.appointment_types;
}
