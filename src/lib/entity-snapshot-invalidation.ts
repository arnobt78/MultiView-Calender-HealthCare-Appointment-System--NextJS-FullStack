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
