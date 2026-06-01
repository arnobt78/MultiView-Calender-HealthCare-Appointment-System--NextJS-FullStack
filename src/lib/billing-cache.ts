/**
 * Server-side cache bust after invoice writes (Redis overview + optional patient user).
 */

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { invalidateAdminDashboardOverviewCaches } from "@/lib/billing-dashboard-cache";

/** Resolve patient login user for Redis overview bust (chart email → users row). */
export async function resolvePatientPortalUserIdForAppointment(
  appointmentId: string | null | undefined
): Promise<string | null> {
  if (!appointmentId) return null;
  const appt = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    select: { patient: { select: { email: true } } },
  });
  const email = appt?.patient?.email;
  if (!email) return null;
  const patientUser = await prisma.user.findFirst({
    where: { email },
    select: { id: true },
  });
  return patientUser?.id ?? null;
}

/** Bust dashboard overview for billing owner and linked patient account when present. */
export async function invalidateBillingRedisCaches(opts: {
  invoiceUserId: string;
  appointmentId?: string | null;
  /** Pass from create handler to skip an extra appointment lookup on POST. */
  patientPortalUserId?: string | null;
}): Promise<void> {
  void redis.invalidateDashboardOverview(opts.invoiceUserId);
  void invalidateAdminDashboardOverviewCaches();

  const patientUserId =
    opts.patientPortalUserId !== undefined
      ? opts.patientPortalUserId
      : await resolvePatientPortalUserIdForAppointment(opts.appointmentId);

  if (patientUserId && patientUserId !== opts.invoiceUserId) {
    void redis.invalidateDashboardOverview(patientUserId);
  }
}
