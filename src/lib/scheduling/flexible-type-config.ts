/**
 * Synthetic visit-type config when a doctor has no bookable appointment types.
 * Drives month-day status via the same slot grid math as typed visits.
 */

import type { SchedulingTypeConfig } from "@/lib/scheduling/scheduling-types";

/** Allowed flex durations (patient step 3 + staff flexible picker). */
export const FLEX_DURATION_OPTIONS = [15, 30, 45, 60] as const;

export type FlexDurationMinutes = (typeof FLEX_DURATION_OPTIONS)[number];

export function isFlexDurationMinutes(value: number): value is FlexDurationMinutes {
  return (FLEX_DURATION_OPTIONS as readonly number[]).includes(value);
}

/** Slot step = visit length; no buffers for flexible bookings. */
export function flexibleSchedulingTypeConfig(
  durationMinutes: FlexDurationMinutes
): SchedulingTypeConfig {
  return {
    duration_minutes: durationMinutes,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    slot_interval_minutes: durationMinutes,
    minimum_notice_minutes: 0,
  };
}
