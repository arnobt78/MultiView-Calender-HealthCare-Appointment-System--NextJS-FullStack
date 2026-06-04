/**
 * Resolves patient/category FK targets after appointment writes so detail + snapshot
 * caches refetch on the current tab without navigation.
 */
import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  getCategoryIdFromAppointmentCache,
  getDoctorIdsFromAppointmentCache,
  getPatientIdFromAppointmentCache,
} from "@/lib/appointment-cache-read";
import {
  invalidateCategoryDetailAndSnapshot,
  invalidateDoctorDetailAndSnapshot,
  invalidatePatientDetailAndSnapshot,
} from "@/lib/entity-snapshot-invalidation";

export type AppointmentMutationInvalidationOpts = {
  appointmentId?: string | null;
  patientId?: string | null;
  categoryId?: string | null;
  previousPatientId?: string | null;
  previousCategoryId?: string | null;
  /** Explicit calendar owner / treating physician — overrides cache when PATCH moves doctors. */
  ownerId?: string | null;
  treatingPhysicianId?: string | null;
  previousOwnerId?: string | null;
  previousTreatingPhysicianId?: string | null;
  /** ICS / Google calendar import — rows may lack category_id; bust entire categories tree */
  bustAllCategorySnapshots?: boolean;
};

export type AppointmentMutationInvalidationTargets = {
  patientIds: string[];
  categoryIds: string[];
  doctorIds: string[];
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
  const fromCacheDoctors = opts?.appointmentId
    ? getDoctorIdsFromAppointmentCache(queryClient, opts.appointmentId)
    : [];

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
    doctorIds: uniqueNonEmpty([
      opts?.ownerId,
      opts?.treatingPhysicianId,
      opts?.previousOwnerId,
      opts?.previousTreatingPhysicianId,
      ...fromCacheDoctors,
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
    ...targets.doctorIds.map((id) => invalidateDoctorDetailAndSnapshot(queryClient, id)),
  ];

  if (targets.bustAllCategorySnapshots) {
    tasks.push(
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }).then(() => undefined)
    );
  }

  if (tasks.length === 0) return;
  await Promise.all(tasks);
}
