import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { AppointmentDetailViewModel } from "@/lib/appointment-detail-view-model";
import { mergeAppointmentIntoDetailViewModel } from "@/lib/appointment-detail-view-model";
import type { Appointment } from "@/types/types";

/** Seed appointment detail cache — key matches `useAppointmentDetail` (SSR + layout effect). */
export function seedAppointmentDetailCache(
  queryClient: QueryClient,
  appointmentId: string,
  model: AppointmentDetailViewModel
): void {
  queryClient.setQueryData(queryKeys.appointments.detail(appointmentId), model);
}

/** Replace detail cache after GET/PATCH — instant detail page refresh without navigation. */
export function patchAppointmentDetailCache(
  queryClient: QueryClient,
  appointmentId: string,
  detail: AppointmentDetailViewModel
): void {
  queryClient.setQueryData(queryKeys.appointments.detail(appointmentId), detail);
}

/**
 * Optimistic detail patch from partial form variables — keeps nested patient/category until refetch.
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
      const merged = mergeAppointmentIntoDetailViewModel(prev, {
        ...prev.appointment,
        ...variables,
        id: appointmentId,
      });
      return merged;
    }
  );
}
