/**
 * Resolves patient/category FK targets after appointment writes so detail + snapshot
 * caches refetch on the current tab without navigation.
 */
import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getCategoryIdFromAppointmentCache,
  getPatientIdFromAppointmentCache,
} from "@/lib/appointment-cache-read";
import {
  invalidateCategoryDetailAndSnapshot,
  invalidatePatientDetailAndSnapshot,
} from "@/lib/entity-snapshot-invalidation";

export type AppointmentMutationInvalidationOpts = {
  appointmentId?: string | null;
  patientId?: string | null;
  categoryId?: string | null;
  previousPatientId?: string | null;
  previousCategoryId?: string | null;
  /** ICS / Google calendar import — rows may lack category_id; bust entire categories tree */
  bustAllCategorySnapshots?: boolean;
};

export type AppointmentMutationInvalidationTargets = {
  patientIds: string[];
  categoryIds: string[];
  bustAllCategorySnapshots: boolean;
};

function uniqueNonEmpty(ids: (string | null | undefined)[]): string[] {
  return [...new Set(ids.filter((id): id is string => typeof id === "string" && id.length > 0))];
}

/** Collect deduped patient/category ids from explicit opts, previous FKs, and list cache. */
export function resolveAppointmentMutationTargets(
  queryClient: QueryClient,
  opts?: AppointmentMutationInvalidationOpts
): AppointmentMutationInvalidationTargets {
  const fromCachePatient = opts?.appointmentId
    ? getPatientIdFromAppointmentCache(queryClient, opts.appointmentId)
    : undefined;
  const fromCacheCategory = opts?.appointmentId
    ? getCategoryIdFromAppointmentCache(queryClient, opts.appointmentId)
    : undefined;

  return {
    patientIds: uniqueNonEmpty([
      opts?.patientId,
      opts?.previousPatientId,
      fromCachePatient,
    ]),
    categoryIds: uniqueNonEmpty([
      opts?.categoryId,
      opts?.previousCategoryId,
      fromCacheCategory,
    ]),
    bustAllCategorySnapshots: opts?.bustAllCategorySnapshots === true,
  };
}

/** Batch invalidation after appointment writes — old + new FK ids and optional bulk category bust. */
export async function invalidateAppointmentEntitySnapshots(
  queryClient: QueryClient,
  targets: AppointmentMutationInvalidationTargets
): Promise<void> {
  const tasks: Promise<void>[] = [
    ...targets.patientIds.map((id) => invalidatePatientDetailAndSnapshot(queryClient, id)),
    ...targets.categoryIds.map((id) => invalidateCategoryDetailAndSnapshot(queryClient, id)),
  ];

  if (targets.bustAllCategorySnapshots) {
    tasks.push(
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }).then(() => undefined)
    );
  }

  if (tasks.length === 0) return;
  await Promise.all(tasks);
}
