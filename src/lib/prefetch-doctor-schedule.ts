/**
 * Warm doctor schedule + visit-type queries before doctor-portal settings paint.
 */

import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AppointmentTypeApiRow } from "@/hooks/useAppointmentTypes";
import type { AvailabilityWindow, TimeOffBlock } from "@/lib/doctor-schedule-types";

export const DOCTOR_SCHEDULE_PREFETCH_STALE_MS = 60_000;

export function prefetchDoctorScheduleSettings(
  queryClient: QueryClient,
  doctorId: string
): void {
  void queryClient.prefetchQuery({
    queryKey: queryKeys.doctors.availability(doctorId),
    queryFn: () =>
      apiClient<{ availability: AvailabilityWindow[] }>(
        `/api/doctor-availability?doctorId=${encodeURIComponent(doctorId)}`
      ),
    staleTime: DOCTOR_SCHEDULE_PREFETCH_STALE_MS,
  });

  void queryClient.prefetchQuery({
    queryKey: queryKeys.doctors.timeOff(doctorId),
    queryFn: () =>
      apiClient<{ timeOff: TimeOffBlock[] }>(
        `/api/doctor-time-off?doctorId=${encodeURIComponent(doctorId)}`
      ),
    staleTime: DOCTOR_SCHEDULE_PREFETCH_STALE_MS,
  });

  void queryClient.prefetchQuery({
    queryKey: queryKeys.appointmentTypes.byDoctor(doctorId),
    queryFn: () =>
      apiClient<{ types: AppointmentTypeApiRow[] }>(
        `/api/appointment-types?doctorId=${encodeURIComponent(doctorId)}`
      ),
    staleTime: 5 * 60 * 1000,
  });
}
