"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { SlotCell } from "@/lib/scheduling/scheduling-types";

export const SCHEDULING_STALE_MS = 60 * 1000;

type DayGridResponse = {
  slots: string[];
  cells: SlotCell[];
  timezone: string;
};

export function useSchedulingDayGrid(opts: {
  doctorId: string | null | undefined;
  dateStr: string | null | undefined;
  typeId: string | null | undefined;
  excludeAppointmentId?: string;
  enabled?: boolean;
}) {
  const { doctorId, dateStr, typeId, excludeAppointmentId, enabled = true } = opts;
  const canFetch = Boolean(enabled && doctorId && dateStr && typeId);

  return useQuery({
    queryKey: queryKeys.availability.dayGrid(
      doctorId ?? "",
      dateStr ?? "",
      typeId ?? "",
      excludeAppointmentId
    ),
    queryFn: () => {
      const q = new URLSearchParams();
      q.set("doctorId", doctorId!);
      q.set("date", dateStr!);
      q.set("typeId", typeId!);
      if (excludeAppointmentId) q.set("excludeAppointmentId", excludeAppointmentId);
      return apiClient<DayGridResponse>(`/api/availability/slots?${q.toString()}`);
    },
    enabled: canFetch,
    staleTime: SCHEDULING_STALE_MS,
    gcTime: 5 * 60 * 1000,
  });
}
