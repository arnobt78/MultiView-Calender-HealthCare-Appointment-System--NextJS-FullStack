import { prisma } from "@/lib/prisma";
import { serializeCategory } from "@/lib/serializers";
import type { Category, CategorySnapshot, CategorySnapshotAppointmentRow } from "@/types/types";

const categorySnapshotAppointmentSelect = {
  id: true,
  title: true,
  start: true,
  end: true,
  status: true,
  owner: { select: { display_name: true, email: true } },
} as const;

function mapCategorySnapshotAppointment(
  row: Awaited<
    ReturnType<
      typeof prisma.appointment.findMany<{ select: typeof categorySnapshotAppointmentSelect }>
    >
  >[number]
): CategorySnapshotAppointmentRow {
  return {
    id: row.id,
    title: row.title,
    start: row.start.toISOString(),
    end: row.end.toISOString(),
    status: row.status,
    owner: {
      display_name: row.owner.display_name,
      email: row.owner.email,
    },
  };
}

/** Shared Prisma load for category snapshot (CP detail live panel + API + SSR prefetch). */
export async function loadCategorySnapshotData(
  categoryId: string
): Promise<CategorySnapshot | null> {
  const catRow = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!catRow) return null;

  const appointmentsRaw = await prisma.appointment.findMany({
    where: { category_id: categoryId },
    orderBy: { start: "desc" },
    take: 15,
    select: categorySnapshotAppointmentSelect,
  });

  const totalCount = await prisma.appointment.count({ where: { category_id: categoryId } });

  return {
    category: serializeCategory(catRow) as Category,
    appointments: appointmentsRaw.map(mapCategorySnapshotAppointment),
    totalCount,
  };
}
