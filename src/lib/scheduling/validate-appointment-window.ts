/**
 * Server-side guards for manual datetime entry and patient slot booking.
 */

import type { PrismaClient } from "@prisma/client";
import { computeDaySlotGrid } from "@/lib/scheduling/availability-slot-grid";

export class AppointmentSchedulingConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppointmentSchedulingConflictError";
  }
}

/** Patient/staff chip booking — slot must be `available` in the day grid. */
export async function assertSlotAvailableForBooking(
  prisma: PrismaClient,
  params: {
    doctorId: string;
    dateStr: string;
    typeId: string;
    slotStartIso: string;
    excludeAppointmentId?: string;
  }
): Promise<void> {
  const { cells } = await computeDaySlotGrid(prisma, params);
  const match = cells.find(
    (c) => c.start === params.slotStartIso && c.status === "available"
  );
  if (!match) {
    throw new AppointmentSchedulingConflictError(
      "Selected time is no longer available. Please pick another slot."
    );
  }
}

/** Manual Start/End — rejects overlap with existing owner appointments (+ buffers via grid rules on chip path only; here simple interval overlap). */
export async function assertNoOwnerAppointmentOverlap(
  prisma: PrismaClient,
  params: {
    doctorId: string;
    start: Date;
    end: Date;
    excludeAppointmentId?: string;
  }
): Promise<void> {
  const { doctorId, start, end, excludeAppointmentId } = params;
  if (!(start < end)) {
    throw new AppointmentSchedulingConflictError("End must be after start.");
  }

  const conflict = await prisma.appointment.findFirst({
    where: {
      owner_id: doctorId,
      status: { not: "cancelled" },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
      start: { lt: end },
      end: { gt: start },
    },
    select: { id: true },
  });

  if (conflict) {
    throw new AppointmentSchedulingConflictError(
      "This time overlaps an existing appointment for the calendar owner."
    );
  }
}
