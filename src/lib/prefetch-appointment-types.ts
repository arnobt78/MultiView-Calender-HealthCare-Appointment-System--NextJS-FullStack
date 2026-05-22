/**
 * Warm `queryKeys.appointmentTypes.byDoctor` before patient booking UI opens.
 * Same queryFn/staleTime as `useAppointmentTypesForDoctor` and `PatientBookingDialog`.
 */

import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { AppointmentTypeApiRow } from "@/hooks/useAppointmentTypes";
import { queryKeys } from "@/lib/query-keys";
import { isValidUUID } from "@/lib/validation";

/** Align with booking wizard + `useAppointmentTypesForDoctor` — avoids redundant refetch on open. */
export const APPOINTMENT_TYPES_PREFETCH_STALE_MS = 5 * 60 * 1000;

/** Best-effort; safe to call from hover handlers (no throw to UI). */
export function prefetchAppointmentTypesForDoctor(
  queryClient: QueryClient,
  doctorId: string | null | undefined
): void {
  if (!doctorId || !isValidUUID(doctorId)) return;
  void queryClient.prefetchQuery({
    queryKey: queryKeys.appointmentTypes.byDoctor(doctorId),
    queryFn: () =>
      apiClient<{ types: AppointmentTypeApiRow[] }>(
        `/api/appointment-types?doctorId=${encodeURIComponent(doctorId)}`
      ),
    staleTime: APPOINTMENT_TYPES_PREFETCH_STALE_MS,
  });
}
