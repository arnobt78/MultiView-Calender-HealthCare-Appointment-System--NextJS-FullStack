/**
 * Idempotent DB patch — Postgres check constraint must allow status 'cancelled'.
 * Legacy DBs may only allow done|pending|alert until this runs once.
 */

import type { PrismaClient } from "@prisma/client";

export async function ensureAppointmentStatusCheckIncludesCancelled(
  prisma: PrismaClient
): Promise<void> {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check`
  );
  await prisma.$executeRawUnsafe(`
    ALTER TABLE appointments
    ADD CONSTRAINT appointments_status_check
    CHECK (
      status IS NULL
      OR status IN ('done', 'pending', 'alert', 'cancelled')
    )
  `);
}
