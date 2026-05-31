import { prisma } from "@/lib/prisma";

/**
 * Paid invoice revenue per doctor (`Invoice.user_id` = treating/owning doctor).
 * Mirrors insights-doctor-aggregate paid revenue semantics (all-time, status = paid).
 */
export async function fetchPaidRevenueCentsByDoctorIds(
  doctorIds: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (doctorIds.length === 0) return map;

  const rows = await prisma.invoice.groupBy({
    by: ["user_id"],
    where: {
      user_id: { in: doctorIds },
      status: "paid",
    },
    _sum: { amount: true },
  });

  for (const row of rows) {
    map.set(row.user_id, row._sum.amount ?? 0);
  }
  return map;
}

/** Attach `paid_revenue_cents` (defaults 0) for each doctor id. */
export function resolveDoctorPaidRevenueCents(
  doctorId: string,
  revenueByDoctor: Map<string, number>
): number {
  return revenueByDoctor.get(doctorId) ?? 0;
}
