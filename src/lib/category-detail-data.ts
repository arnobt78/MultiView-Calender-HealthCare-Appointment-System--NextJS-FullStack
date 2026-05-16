import { prisma } from "@/lib/prisma";
import { serializeCategory } from "@/lib/serializers";
import type { Category } from "@/types/types";

/** Shared Prisma load for category detail pages (CP + portal). */
export async function loadCategoryDetailData(categoryId: string) {
  const catRow = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!catRow) return null;

  const appointments = await prisma.appointment.findMany({
    where: { category_id: categoryId },
    orderBy: { start: "desc" },
    take: 15,
    select: {
      id: true,
      title: true,
      start: true,
      end: true,
      status: true,
      owner: { select: { display_name: true, email: true } },
    },
  });

  const totalCount = await prisma.appointment.count({ where: { category_id: categoryId } });

  return {
    cat: serializeCategory(catRow) as Category,
    appointments,
    totalCount,
  };
}
