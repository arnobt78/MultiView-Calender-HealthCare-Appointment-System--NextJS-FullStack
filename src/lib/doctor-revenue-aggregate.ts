import { prisma } from "@/lib/prisma";

/**
 * Paid invoice revenue per doctor — credits visit treating physician, then calendar owner, then billing user_id.
 * Fixes Demo Doctor €0 when invoices bill calendar owner but doctor treats the visit.
 */
export async function fetchPaidRevenueCentsByDoctorIds(
  doctorIds: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (doctorIds.length === 0) return map;
  for (const id of doctorIds) map.set(id, 0);

  const rows = await prisma.invoice.findMany({
    where: {
      status: "paid",
      OR: [
        { user_id: { in: doctorIds } },
        {
          appointment: {
            OR: [
              { owner_id: { in: doctorIds } },
              { treating_physician_id: { in: doctorIds } },
            ],
          },
        },
      ],
    },
    select: {
      amount: true,
      user_id: true,
      appointment: {
        select: { owner_id: true, treating_physician_id: true },
      },
    },
  });

  const doctorSet = new Set(doctorIds);

  for (const row of rows) {
    const appt = row.appointment as {
      owner_id: string;
      treating_physician_id: string | null;
    } | null;
    const attributed =
      (appt?.treating_physician_id && doctorSet.has(appt.treating_physician_id)
        ? appt.treating_physician_id
        : null) ??
      (appt?.owner_id && doctorSet.has(appt.owner_id) ? appt.owner_id : null) ??
      (doctorSet.has(row.user_id) ? row.user_id : null);

    if (!attributed) continue;
    map.set(attributed, (map.get(attributed) ?? 0) + row.amount);
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
