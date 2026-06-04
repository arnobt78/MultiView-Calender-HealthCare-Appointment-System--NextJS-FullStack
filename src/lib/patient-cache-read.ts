/**
 * Read patient FK ids from TanStack cache — invalidation resolvers (no circular imports).
 */
import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Patient } from "@/types/types";

/** Primary doctor UUID from patients list or detail cache before a write. */
export function getPrimaryDoctorIdFromPatientCache(
  queryClient: QueryClient,
  patientId: string | null | undefined
): string | undefined {
  if (!patientId) return undefined;
  const detail = queryClient.getQueryData<Patient>(queryKeys.patients.detail(patientId));
  if (detail?.primary_doctor_id) return detail.primary_doctor_id;
  const list = queryClient.getQueryData<Patient[]>(queryKeys.patients.all);
  return list?.find((p) => p.id === patientId)?.primary_doctor_id ?? undefined;
}
