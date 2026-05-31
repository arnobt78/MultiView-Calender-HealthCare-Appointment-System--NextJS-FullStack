import { prisma } from "@/lib/prisma";
import { serializeCategory } from "@/lib/serializers";
import {
  appointmentSnapshotInclude,
  mapAppointmentToSnapshotRow,
  type AppointmentSnapshotPrismaRow,
} from "@/lib/appointment-snapshot-row";
import type { Category, CategorySnapshot } from "@/types/types";

/** Shared Prisma load for category snapshot (CP detail live panel + API + SSR prefetch). */
export async function loadCategorySnapshotData(
  categoryId: string
): Promise<CategorySnapshot | null> {
  const catRow = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!catRow) return null;

  const appointmentsRaw = await prisma.appointment.findMany({
    where: { category_id: categoryId },
    orderBy: { start: "desc" },
    take: 50,
    include: appointmentSnapshotInclude,
  });

  const totalCount = await prisma.appointment.count({ where: { category_id: categoryId } });

  return {
    category: serializeCategory(catRow) as Category,
    appointments: appointmentsRaw.map((a) =>
      mapAppointmentToSnapshotRow(a as AppointmentSnapshotPrismaRow)
    ),
    totalCount,
  };
}
