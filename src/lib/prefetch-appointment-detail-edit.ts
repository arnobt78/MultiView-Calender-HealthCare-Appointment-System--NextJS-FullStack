/**
 * Warm TanStack caches before appointment detail edit dialog opens (SSR seed + mount prefetch).
 */
import type { QueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { prefetchAppointmentTypesForDoctor } from "@/lib/prefetch-appointment-types";
import { prefetchDoctorsDirectory } from "@/lib/prefetch-doctors-directory";
import { prefetchSchedulingMonthWithAdjacent } from "@/lib/prefetch-scheduling";
import { isValidUUID } from "@/lib/validation";

export type AppointmentDetailEditWarmupInput = {
  treatingPhysicianId?: string | null;
  calendarOwnerId?: string | null;
  appointmentTypeId?: string | null;
  appointmentStart?: string | null;
  excludeAppointmentId?: string | null;
};

/** Best-effort — doctors, visit types, and scheduling month for treating physician. */
export function prefetchAppointmentDetailEditWarmup(
  queryClient: QueryClient,
  input: AppointmentDetailEditWarmupInput
): void {
  prefetchDoctorsDirectory(queryClient);

  const schedDoctor = input.treatingPhysicianId?.trim() || input.calendarOwnerId?.trim() || "";
  if (!isValidUUID(schedDoctor)) return;

  prefetchAppointmentTypesForDoctor(queryClient, schedDoctor);

  const typeId = input.appointmentTypeId?.trim() ?? "";
  if (isValidUUID(typeId)) {
    prefetchSchedulingMonthWithAdjacent(queryClient, {
      doctorId: schedDoctor,
      schedulingScope: { kind: "type", typeId },
      excludeAppointmentId: input.excludeAppointmentId ?? undefined,
    });
  }
}

/** Derive slot-picker date string from appointment UTC start (local calendar day). */
export function appointmentStartToSlotPickDateStr(start?: string | null): string {
  if (!start?.trim()) return "";
  const parsed = parseISO(start);
  if (Number.isNaN(parsed.getTime())) return "";
  return format(parsed, "yyyy-MM-dd");
}
