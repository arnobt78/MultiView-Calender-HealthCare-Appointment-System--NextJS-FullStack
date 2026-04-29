"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

type SlotsResponse = { slots: string[]; timezone: string };

export function useAvailabilitySlots(
  doctorId: string | null | undefined,
  dateStr: string | null | undefined,
  typeId: string | null | undefined
) {
  const enabled = Boolean(doctorId && dateStr && typeId);

  return useQuery({
    queryKey: queryKeys.availability.slots(doctorId ?? "", dateStr ?? "", typeId ?? ""),
    queryFn: () => {
      const q = new URLSearchParams();
      q.set("doctorId", doctorId!);
      q.set("date", dateStr!);
      q.set("typeId", typeId!);
      return apiClient<SlotsResponse>(`/api/availability/slots?${q.toString()}`);
    },
    enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
