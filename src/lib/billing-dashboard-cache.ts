/**
 * Redis bust for admin CP dashboard after billing writes (admin revenue is global, not user_id scoped).
 */

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

/** Invalidate overview cache for every admin — CP revenue KPIs are org-wide. */
export async function invalidateAdminDashboardOverviewCaches(): Promise<void> {
  const admins = await prisma.user.findMany({
    where: { role: "admin" },
    select: { id: true },
  });
  await Promise.all(
    admins.map((a) => redis.invalidateDashboardOverview(a.id))
  );
}
