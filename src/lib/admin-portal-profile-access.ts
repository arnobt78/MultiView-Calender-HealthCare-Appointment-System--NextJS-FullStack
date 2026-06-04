/**
 * Portal admin profile — `/admins/:id` for doctors viewing admin calendar owners.
 * Patients use plain labels on doctor detail (no admin portal route).
 */

import { prisma } from "@/lib/prisma";
import { isDoctorRole } from "@/lib/rbac";

export type AdminPortalProfileAccessSession = {
  userId: string;
  role: string | null;
};

/** Target is an admin account — directory + snapshot calendar-owner links. */
export async function canViewAdminPortalProfile(
  session: AdminPortalProfileAccessSession,
  targetAdminId: string
): Promise<boolean> {
  if (!isDoctorRole(session.role)) return false;
  const row = await prisma.user.findFirst({
    where: { id: targetAdminId, role: "admin" },
    select: { id: true },
  });
  return row != null;
}
