/**
 * SSR + TanStack staff directory merge — first-paint portraits/specialty without waiting on useUsers.
 * Seeds from `prefetchDoctors`, `prefetchUsersList`, and denormalized patient/doctor fields.
 */
import type { DoctorPrefetchRow } from "@/lib/server-prefetch";
import type { Patient } from "@/types/types";
import type { User } from "@/types/types";

export type StaffDirectoryEntry = {
  id: string;
  email?: string | null;
  display_name?: string | null;
  image?: string | null;
  specialty?: string | null;
};

export type PatientPrimaryDoctorFields = Pick<
  Patient,
  | "primary_doctor_id"
  | "primary_doctor_display"
  | "primary_doctor_email"
  | "primary_doctor_specialty"
  | "primary_doctor_image"
>;

function mergeStaffEntry(
  map: Map<string, StaffDirectoryEntry>,
  u: StaffDirectoryEntry
): void {
  const prev = map.get(u.id);
  const prevImage = prev?.image?.trim();
  const nextImage = u.image?.trim();
  map.set(u.id, {
    id: u.id,
    email: u.email ?? prev?.email ?? null,
    display_name: u.display_name ?? prev?.display_name ?? null,
    // Keep first non-empty portrait so SSR-seeded rows are not overwritten by later empty fetches.
    image: prevImage || nextImage || prev?.image?.trim() || null,
    specialty: u.specialty ?? prev?.specialty ?? null,
  });
}

/** Merge doctor directory prefetch + users list rows into one lookup for identity cells. */
export function buildStaffDirectoryMap(input: {
  initialDoctors?: { doctors: DoctorPrefetchRow[] } | null;
  doctorUsers?: User[] | null;
  adminUsers?: User[] | null;
}): Map<string, StaffDirectoryEntry> {
  const map = new Map<string, StaffDirectoryEntry>();
  for (const d of input.initialDoctors?.doctors ?? []) {
    mergeStaffEntry(map, {
      id: d.id,
      email: d.email,
      display_name: d.display_name,
      image: d.image,
      specialty: d.specialty ?? null,
    });
  }
  for (const u of input.doctorUsers ?? []) {
    if (!u.id) continue;
    mergeStaffEntry(map, {
      id: u.id,
      email: u.email,
      display_name: u.display_name,
      image: u.image,
      specialty: u.specialty ?? null,
    });
  }
  for (const u of input.adminUsers ?? []) {
    if (!u.id) continue;
    mergeStaffEntry(map, {
      id: u.id,
      email: u.email,
      display_name: u.display_name,
      image: u.image,
      specialty: u.specialty ?? null,
    });
  }
  return map;
}

/** Primary doctor block — patient denormalized fields win on first paint; directory fills gaps. */
export function resolvePrimaryDoctorIdentity(
  patient: PatientPrimaryDoctorFields,
  staffById: Map<string, StaffDirectoryEntry>
): StaffDirectoryEntry | null {
  const id = patient.primary_doctor_id;
  if (!id || !patient.primary_doctor_display?.trim()) return null;
  const cached = staffById.get(id);
  const image =
    patient.primary_doctor_image?.trim() ||
    cached?.image?.trim() ||
    null;
  return {
    id,
    email: patient.primary_doctor_email ?? cached?.email ?? null,
    display_name: patient.primary_doctor_display.trim(),
    image,
    specialty: patient.primary_doctor_specialty ?? cached?.specialty ?? null,
  };
}
