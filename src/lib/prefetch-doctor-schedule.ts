/**
 * Client cache seed + warm fetch for doctor portal schedule / visit-type panels.
 */

import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { DoctorPortalSettingsPrefetch } from "@/lib/doctor-portal-settings-prefetch";
import type { AppointmentTypeApiRow } from "@/hooks/useAppointmentTypes";
import type { AvailabilityWindow, TimeOffBlock } from "@/lib/doctor-schedule-types";

export const DOCTOR_SCHEDULE_PREFETCH_STALE_MS = 60_000;

/** SSR props → TanStack cache (same keys as weekly/time-off/type editors). */
export function seedDoctorPortalSettingsCache(
  queryClient: QueryClient,
  doctorId: string,
  seed: DoctorPortalSettingsPrefetch
): void {
  queryClient.setQueryData(queryKeys.doctors.availability(doctorId), seed.availability);
  queryClient.setQueryData(queryKeys.doctors.timeOff(doctorId), seed.timeOff);
  queryClient.setQueryData(queryKeys.appointmentTypes.byDoctor(doctorId), seed.appointmentTypes);
}

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
