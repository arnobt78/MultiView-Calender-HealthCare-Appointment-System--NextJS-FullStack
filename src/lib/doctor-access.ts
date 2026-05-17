/**
 * Doctor profile access — portal `/doctors/:id` vs admin control panel.
 *
 * Directory browsing (`/services`): any authenticated user may open a doctor user's
 * public profile (same data shown on service cards). Admin CP detail stays admin-only.
 */

import { prisma } from "@/lib/prisma";
import { isAdminRole } from "@/lib/rbac";

export type DoctorAccessSession = {
  userId: string;
  email: string;
  role: string | null;
};

/** Target exists and is a doctor account — used for `/services` directory profile links. */
export async function canViewDoctorDirectoryProfile(targetDoctorId: string): Promise<boolean> {
  const row = await prisma.user.findFirst({
    where: { id: targetDoctorId, role: "doctor" },
    select: { id: true },
  });
  return row != null;
}

/** Server gate for `/doctors/:id` (non-admin). */
export async function canViewDoctorPortalProfile(
  session: DoctorAccessSession,
  targetDoctorId: string
): Promise<boolean> {
  if (isAdminRole(session.role)) return true;
  return canViewDoctorDirectoryProfile(targetDoctorId);
}
