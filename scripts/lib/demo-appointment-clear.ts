/**
 * FK-safe wipe of all appointments and dependent billing rows.
 * Order: payments → invoices → assignees → appointments.
 * Used by db:reset-demo-appointments and curated seed re-runs.
 */

import type { PrismaClient } from "@prisma/client";

export async function clearAllAppointmentsAndBilling(
  prisma: PrismaClient
): Promise<void> {
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.appointmentAssignee.deleteMany({});
  await prisma.appointment.deleteMany({});
}
