"use client";

import { useLayoutEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AppointmentDetailApiPayload } from "@/lib/appointment-detail-api";
import type { AppointmentDetailViewModel } from "@/lib/appointment-detail-view-model";

type Options = {
  /** SSR seed — stable first paint; invalidated mutations refetch via GET. */
  initialData?: AppointmentDetailViewModel;
};

/**
 * Appointment detail — mirrors GET `/api/appointments/[id]` `detail` field.
 * SSR seeds cache; `invalidateAfterAppointmentMutation` busts key → background refetch.
 */
export function useAppointmentDetail(appointmentId: string, options?: Options) {
  const queryClient = useQueryClient();
  const key = queryKeys.appointments.detail(appointmentId);

  useLayoutEffect(() => {
    if (options?.initialData != null) {
      queryClient.setQueryData(key, options.initialData);
    }
  }, [queryClient, key, options?.initialData]);

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = await apiClient<AppointmentDetailApiPayload>(
        `/api/appointments/${appointmentId}`
      );
      return res.detail;
    },
    initialData: options?.initialData,
    staleTime: 60_000,
    enabled: Boolean(appointmentId),
  });
}
