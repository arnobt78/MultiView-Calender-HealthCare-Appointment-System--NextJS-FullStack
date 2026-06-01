/**
 * Server-side cache bust after invoice writes (Redis overview + optional patient user).
 */

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

/** Bust dashboard overview for billing owner and linked patient account when present. */
export async function invalidateBillingRedisCaches(opts: {
  invoiceUserId: string;
  appointmentId?: string | null;
}): Promise<void> {
  void redis.invalidateDashboardOverview(opts.invoiceUserId);

  if (!opts.appointmentId) return;

  const appt = await prisma.appointment.findUnique({
    where: { id: opts.appointmentId },
    select: {
      patient: { select: { email: true } },
    },
  });
  const email = appt?.patient?.email;
  if (!email) return;

  const patientUser = await prisma.user.findFirst({
    where: { email },
    select: { id: true },
  });
  if (patientUser?.id && patientUser.id !== opts.invoiceUserId) {
    void redis.invalidateDashboardOverview(patientUser.id);
  }
}
