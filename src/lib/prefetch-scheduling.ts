/**
 * Warm scheduling month + day queries before booking dialogs open.
 * Adjacent-month prefetch removes spinner flash when navigating the calendar.
 */

import type { QueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { isValidUUID } from "@/lib/validation";
import type { MonthDayEntry, SchedulingScopeKey, SlotCell } from "@/lib/scheduling/scheduling-types";
import {
  addMonthsToYm,
  buildAvailabilityDatesSearchParams,
  schedulingScopeKeySegment,
} from "@/lib/scheduling/scheduling-scope";
import { SCHEDULING_STALE_MS } from "@/hooks/useSchedulingDayGrid";

function canPrefetchScheduling(
  doctorId: string,
  schedulingScope: SchedulingScopeKey
): boolean {
  if (!isValidUUID(doctorId)) return false;
  if (schedulingScope.kind === "type") {
    return isValidUUID(schedulingScope.typeId);
  }
  return true;
}

export function prefetchSchedulingMonth(
  queryClient: QueryClient,
  opts: {
    doctorId: string;
    schedulingScope: SchedulingScopeKey;
    monthYm?: string;
    excludeAppointmentId?: string;
  }
): void {
  const { doctorId, schedulingScope, excludeAppointmentId } = opts;
  if (!canPrefetchScheduling(doctorId, schedulingScope)) return;

  const monthYm = opts.monthYm ?? format(new Date(), "yyyy-MM");
  const scopeKey = schedulingScopeKeySegment(schedulingScope);

  void queryClient.prefetchQuery({
    queryKey: queryKeys.availability.dates(
      doctorId,
      scopeKey,
      monthYm,
      excludeAppointmentId
    ),
    queryFn: async () => {
      const q = buildAvailabilityDatesSearchParams({
        doctorId,
        schedulingScope,
        monthYm,
        excludeAppointmentId,
      });
      return apiClient<{ days: MonthDayEntry[]; timezone: string }>(
        `/api/availability/dates?${q.toString()}`
      );
    },
    staleTime: SCHEDULING_STALE_MS,
  });
}

/** Prefetch previous + next month for instant calendar navigation. */
export function prefetchSchedulingMonthsAdjacent(
  queryClient: QueryClient,
  opts: {
    doctorId: string;
    schedulingScope: SchedulingScopeKey;
    monthYm: string;
    excludeAppointmentId?: string;
  }
): void {
  const { doctorId, schedulingScope, monthYm, excludeAppointmentId } = opts;
  if (!canPrefetchScheduling(doctorId, schedulingScope)) return;

  prefetchSchedulingMonth(queryClient, {
    doctorId,
    schedulingScope,
    monthYm: addMonthsToYm(monthYm, -1),
    excludeAppointmentId,
  });
  prefetchSchedulingMonth(queryClient, {
    doctorId,
    schedulingScope,
    monthYm: addMonthsToYm(monthYm, 1),
    excludeAppointmentId,
  });
}

/** Current visible month plus neighbors — use on dialog open and type/flex change. */
export function prefetchSchedulingMonthWithAdjacent(
  queryClient: QueryClient,
  opts: {
    doctorId: string;
    schedulingScope: SchedulingScopeKey;
    monthYm?: string;
    excludeAppointmentId?: string;
  }
): void {
  const monthYm = opts.monthYm ?? format(new Date(), "yyyy-MM");
  prefetchSchedulingMonth(queryClient, { ...opts, monthYm });
  prefetchSchedulingMonthsAdjacent(queryClient, { ...opts, monthYm });
}

export function prefetchSchedulingDay(
  queryClient: QueryClient,
  opts: {
    doctorId: string;
    typeId: string;
    dateStr: string;
    excludeAppointmentId?: string;
  }
): void {
  const { doctorId, typeId, dateStr, excludeAppointmentId } = opts;
  if (!isValidUUID(doctorId) || !isValidUUID(typeId) || !dateStr) return;

  const scopeKey = typeId;

  void queryClient.prefetchQuery({
    queryKey: queryKeys.availability.dayGrid(
      doctorId,
      dateStr,
      scopeKey,
      excludeAppointmentId
    ),
    queryFn: async () => {
      const q = new URLSearchParams();
      q.set("doctorId", doctorId);
      q.set("date", dateStr);
      q.set("typeId", typeId);
      if (excludeAppointmentId) q.set("excludeAppointmentId", excludeAppointmentId);
      return apiClient<{ slots: string[]; cells: SlotCell[]; timezone: string }>(
        `/api/availability/slots?${q.toString()}`
      );
    },
    staleTime: SCHEDULING_STALE_MS,
  });
}
