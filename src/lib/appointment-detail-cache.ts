import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import {
  applyAppointmentDetailNestedEntities,
  type AppointmentDetailViewModel,
} from "@/lib/appointment-detail-view-model";
import type { Appointment, Category, Patient } from "@/types/types";

/** Seed appointment detail cache — key matches `useAppointmentDetail` (SSR + layout effect). */
export function seedAppointmentDetailCache(
  queryClient: QueryClient,
  appointmentId: string,
  model: AppointmentDetailViewModel
): void {
  queryClient.setQueryData(queryKeys.appointments.detail(appointmentId), model);
}

/** Replace detail cache after GET/PATCH/POST — instant detail page refresh without navigation. */
export function patchAppointmentDetailCache(
  queryClient: QueryClient,
  appointmentId: string,
  detail: AppointmentDetailViewModel
): void {
  queryClient.setQueryData(queryKeys.appointments.detail(appointmentId), detail);
}

/** Resolve patient row from TanStack list cache for optimistic detail People section. */
function lookupPatientFromQueryCache(
  queryClient: QueryClient,
  patientId: string
): Patient | null {
  const list = queryClient.getQueryData<Patient[]>(queryKeys.patients.all);
  return list?.find((p) => p.id === patientId) ?? null;
}

/** Resolve category row from TanStack list cache for optimistic detail overview. */
function lookupCategoryFromQueryCache(
  queryClient: QueryClient,
  categoryId: string
): Category | null {
  const list = queryClient.getQueryData<Category[]>(queryKeys.categories.all);
  return list?.find((c) => c.id === categoryId) ?? null;
}

/**
 * Optimistic detail patch — merges form variables; resolves patient/category from list caches
 * when IDs change so People + subtitle update before PATCH `detail` returns.
 */
export function patchAppointmentDetailCacheOptimistic(
  queryClient: QueryClient,
  appointmentId: string,
  variables: Partial<Appointment> & { id: string }
): void {
  queryClient.setQueryData(
    queryKeys.appointments.detail(appointmentId),
    (prev: AppointmentDetailViewModel | undefined) => {
      if (!prev) return prev;

      const nested: { patient?: Patient | null; category?: Category | null } = {};
      if ("patient" in variables) {
        const pid = variables.patient ?? null;
        nested.patient = pid ? lookupPatientFromQueryCache(queryClient, pid) : null;
      }
      if ("category" in variables) {
        const cid = variables.category ?? null;
        nested.category = cid ? lookupCategoryFromQueryCache(queryClient, cid) : null;
      }

      return applyAppointmentDetailNestedEntities(
        prev,
        { ...prev.appointment, ...variables, id: appointmentId },
        Object.keys(nested).length > 0 ? nested : undefined
      );
    }
  );
}
