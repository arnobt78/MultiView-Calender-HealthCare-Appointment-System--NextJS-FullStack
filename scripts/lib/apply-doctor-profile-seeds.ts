/**
 * Idempotent upsert of professional fields for all demo doctors (shared seed map).
 */
import type { PrismaClient } from "@prisma/client";
import { DOCTOR_PROFILES } from "./doctor-profile-seed-data";

export async function applyDoctorProfileSeeds(prisma: PrismaClient): Promise<number> {
  let updated = 0;
  for (const [email, profile] of Object.entries(DOCTOR_PROFILES)) {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) continue;
    await prisma.user.update({ where: { id: user.id }, data: profile });
    updated += 1;
  }
  return updated;
}
