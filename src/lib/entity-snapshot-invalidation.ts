/**
 * Narrow invalidation for patient/category detail + snapshot panels.
 * Shared by query-client exports and appointment-mutation-invalidation.
 */
import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

/** Detail + snapshot for one patient — avoids refetching full patient list when not needed. */
export async function invalidatePatientDetailAndSnapshot(
  queryClient: QueryClient,
  patientId: string | null | undefined
): Promise<void> {
  if (!patientId) return;
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.patients.snapshot(patientId) }),
  ]);
}

/** Detail + snapshot for one category — CP/portal appointments panel. */
export async function invalidateCategoryDetailAndSnapshot(
  queryClient: QueryClient,
  categoryId: string | null | undefined
): Promise<void> {
  if (!categoryId) return;
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.detail(categoryId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.snapshot(categoryId) }),
  ]);
}

/** User detail + related-appointments snapshot for one doctor — portal `/doctors/:id` + CP detail. */
export async function invalidateDoctorDetailAndSnapshot(
  queryClient: QueryClient,
  doctorId: string | null | undefined
): Promise<void> {
  if (!doctorId) return;
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(doctorId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.doctors.snapshot(doctorId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.doctors.assignedPatients(doctorId) }),
  ]);
}

function uniqueDoctorIds(ids: (string | null | undefined)[]): string[] {
  return [...new Set(ids.filter((id): id is string => typeof id === "string" && id.length > 0))];
}

/**
 * Patient CRUD — bust primary-doctor detail + snapshot + roster for old/new assignees.
 * Call alongside `invalidateEntityAffectingAppointments` (appointments list still invalidates globally).
 */
export async function invalidateDoctorsAffectedByPatientWrite(
  queryClient: QueryClient,
  opts: {
    primaryDoctorId?: string | null;
    previousPrimaryDoctorId?: string | null;
  }
): Promise<void> {
  const doctorIds = uniqueDoctorIds([opts.primaryDoctorId, opts.previousPrimaryDoctorId]);
  if (doctorIds.length === 0) return;
  await Promise.all(
    doctorIds.map((id) => invalidateDoctorDetailAndSnapshot(queryClient, id))
  );
}
