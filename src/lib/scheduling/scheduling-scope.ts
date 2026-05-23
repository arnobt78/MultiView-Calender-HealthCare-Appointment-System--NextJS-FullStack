/**
 * TanStack query key segments + month navigation for scheduling prefetch.
 */

import { isValidUUID } from "@/lib/validation";
import type { SchedulingScopeKey } from "@/lib/scheduling/scheduling-types";
import { isFlexDurationMinutes } from "@/lib/scheduling/flexible-type-config";

/** Stable key segment: UUID type id or `flex:30`. */
export function schedulingScopeKeySegment(scope: SchedulingScopeKey): string {
  return scope.kind === "type" ? scope.typeId : `flex:${scope.durationMinutes}`;
}

export function schedulingScopeFromKeySegment(segment: string): SchedulingScopeKey | null {
  if (segment.startsWith("flex:")) {
    const minutes = Number(segment.slice(5));
    if (isFlexDurationMinutes(minutes)) {
      return { kind: "flex", durationMinutes: minutes };
    }
    return null;
  }
  if (isValidUUID(segment)) {
    return { kind: "type", typeId: segment };
  }
  return null;
}

/** Shift `YYYY-MM` by `delta` months (used for adjacent-month prefetch). */
export function addMonthsToYm(monthYm: string, delta: number): string {
  const match = /^(\d{4})-(\d{2})$/.exec(monthYm);
  if (!match) return monthYm;
  let year = Number(match[1]);
  let month = Number(match[2]) + delta;
  while (month < 1) {
    month += 12;
    year -= 1;
  }
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function buildAvailabilityDatesSearchParams(opts: {
  doctorId: string;
  schedulingScope: SchedulingScopeKey;
  monthYm: string;
  excludeAppointmentId?: string;
}): URLSearchParams {
  const q = new URLSearchParams();
  q.set("doctorId", opts.doctorId);
  q.set("month", opts.monthYm);
  if (opts.schedulingScope.kind === "type") {
    q.set("typeId", opts.schedulingScope.typeId);
  } else {
    q.set("flexDurationMinutes", String(opts.schedulingScope.durationMinutes));
  }
  if (opts.excludeAppointmentId) {
    q.set("excludeAppointmentId", opts.excludeAppointmentId);
  }
  return q;
}
