/**
 * Post-login welcome toast: today's appointment count scoped by role.
 * Patients: `patient_id` via chart email (not `owner_id` — patients rarely own rows).
 * Staff: calendar owner OR treating physician (aligned with dashboard list + insights).
 */

import { endOfDay, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { staffCalendarAppointmentFilter } from "@/lib/staff-appointment-calendar-scope";

export async function countTodayAppointmentsForLoginUser(
  userId: string,
  role: string,
  email: string
): Promise<number> {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  if (role === "patient") {
    const patient = await prisma.patient.findFirst({
      where: { email },
      select: { id: true },
    });
    if (!patient) return 0;
    return prisma.appointment.count({
      where: {
        patient_id: patient.id,
        start: { gte: todayStart, lte: todayEnd },
      },
    });
  }

  return prisma.appointment.count({
    where: staffCalendarAppointmentFilter(userId, {
      start: { gte: todayStart, lte: todayEnd },
    }),
  });
}
