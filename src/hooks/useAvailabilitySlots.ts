"use client";

/**
 * Legacy hook — returns available ISO starts only.
 * Prefer `useSchedulingDayGrid` when rendering full slot grids with booked/past states.
 */

import { useSchedulingDayGrid } from "@/hooks/useSchedulingDayGrid";

export function useAvailabilitySlots(
  doctorId: string | null | undefined,
  dateStr: string | null | undefined,
  typeId: string | null | undefined,
  excludeAppointmentId?: string
) {
  const query = useSchedulingDayGrid({
    doctorId,
    dateStr,
    typeId,
    excludeAppointmentId,
  });

  return {
    ...query,
    data: query.data
      ? { slots: query.data.slots, timezone: query.data.timezone }
      : undefined,
  };
}
