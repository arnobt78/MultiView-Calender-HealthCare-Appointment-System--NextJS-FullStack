"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AppointmentDetailApiPayload } from "@/lib/appointment-detail-api";
import type { AppointmentDetailViewModel } from "@/lib/appointment-detail-view-model";

type Options = {
  /** SSR seed — TanStack `initialData` only; do not re-seed in layout effects (avoids update loops). */
  initialData?: AppointmentDetailViewModel;
};

/**
 * Appointment detail — mirrors GET `/api/appointments/[id]` `detail` field.
 * SSR `initialData` + `refetchOnMount: false`; mutations invalidate → background refetch.
 */
export function useAppointmentDetail(appointmentId: string, options?: Options) {
  const hasSsrSeed = options?.initialData != null;

  return useQuery({
    queryKey: queryKeys.appointments.detail(appointmentId),
    queryFn: async () => {
      const res = await apiClient<AppointmentDetailApiPayload>(
        `/api/appointments/${appointmentId}`
      );
      return res.detail;
    },
    initialData: options?.initialData,
    staleTime: 60_000,
    refetchOnMount: hasSsrSeed ? false : true,
    enabled: Boolean(appointmentId),
  });
}
