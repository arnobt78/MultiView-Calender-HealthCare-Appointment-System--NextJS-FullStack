"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { MonthDayEntry, SchedulingScopeKey } from "@/lib/scheduling/scheduling-types";
import {
  buildAvailabilityDatesSearchParams,
  schedulingScopeKeySegment,
} from "@/lib/scheduling/scheduling-scope";
import { SCHEDULING_STALE_MS } from "@/hooks/useSchedulingDayGrid";

type MonthDatesResponse = {
  days: MonthDayEntry[];
  timezone: string;
};

export function useSchedulingMonthDates(opts: {
  doctorId: string | null | undefined;
  schedulingScope: SchedulingScopeKey | null | undefined;
  monthYm: string;
  excludeAppointmentId?: string;
  enabled?: boolean;
}) {
  const { doctorId, schedulingScope, monthYm, excludeAppointmentId, enabled = true } = opts;
  const scopeKey =
    schedulingScope != null ? schedulingScopeKeySegment(schedulingScope) : "";
  const canFetch = Boolean(enabled && doctorId && schedulingScope && monthYm);

  return useQuery({
    queryKey: queryKeys.availability.dates(
      doctorId ?? "",
      scopeKey,
      monthYm,
      excludeAppointmentId
    ),
    queryFn: () => {
      const q = buildAvailabilityDatesSearchParams({
        doctorId: doctorId!,
        schedulingScope: schedulingScope!,
        monthYm,
        excludeAppointmentId,
      });
      return apiClient<MonthDatesResponse>(`/api/availability/dates?${q.toString()}`);
    },
    enabled: canFetch,
    staleTime: SCHEDULING_STALE_MS,
    gcTime: 5 * 60 * 1000,
  });
}
