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
};

export type DoctorsDirectoryResponse = {
  doctors: DoctorDirectoryRow[];
};

/** Prefer server-merged bookable list; never treat empty array as “missing”. */
export function resolveDoctorBookableTypes(
  doctor: Pick<DoctorDirectoryRow, "bookable_appointment_types" | "appointment_types"> & {
    id?: string;
  }
): DoctorDirectoryAppointmentType[] {
  const bookable = doctor.bookable_appointment_types;
  const owned = doctor.appointment_types;
  const resolved = bookable != null ? bookable : owned;
  // #region agent log — H1: missing bookable forces owned-only fallback
  if (bookable == null && typeof globalThis !== "undefined") {
    fetch("http://127.0.0.1:7938/ingest/15849825-35e9-4832-9975-ca3563c056ec", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "6e525f" },
      body: JSON.stringify({
        sessionId: "6e525f",
        hypothesisId: "H1",
        location: "doctor-directory.ts:resolveDoctorBookableTypes",
        message: "bookable missing — fallback to appointment_types (owned only)",
        data: {
          doctorId: doctor.id ?? null,
          ownedLen: owned?.length ?? null,
          resolvedGlobalCount: resolved.filter((t) => t.is_global === true).length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion
  return resolved;
}
