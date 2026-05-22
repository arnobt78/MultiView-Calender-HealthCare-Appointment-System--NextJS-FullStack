/**
 * Post-login welcome toast: today's appointment count scoped by role.
 * Patients: `patient_id` via chart email (not `owner_id` — patients rarely own rows).
 * Staff: `owner_id` (calendar owner), aligned with demo login and dashboard overview.
 */

import { endOfDay, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";

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
    where: {
      owner_id: userId,
      start: { gte: todayStart, lte: todayEnd },
    },
  });
}
