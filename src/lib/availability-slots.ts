/**
 * Legacy slot list API — returns only available ISO starts.
 * Day grid with booked/past/blocked lives in `src/lib/scheduling/availability-slot-grid.ts`.
 */

import type { PrismaClient } from "@prisma/client";
import { computeDaySlotGrid, getJsWeekdayInTimezone } from "@/lib/scheduling/availability-slot-grid";

export { getJsWeekdayInTimezone } from "@/lib/scheduling/availability-slot-grid";

export async function computeAvailabilitySlots(
  prisma: PrismaClient,
  params: {
    doctorId: string;
    dateStr: string;
    typeId: string;
    excludeAppointmentId?: string;
  }
): Promise<{ slots: string[]; timezone: string; cells: import("@/lib/scheduling/scheduling-types").SlotCell[] }> {
  const { cells, timezone } = await computeDaySlotGrid(prisma, params);
  const slots = cells.filter((c) => c.status === "available").map((c) => c.start);
  return { slots, timezone, cells };
}
