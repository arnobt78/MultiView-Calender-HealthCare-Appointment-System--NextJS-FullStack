import type { Category } from "@/types/types";
import { loadCategorySnapshotData } from "@/lib/category-snapshot-data";

/** Shared Prisma load for category detail pages (CP + portal). */
export async function loadCategoryDetailData(categoryId: string) {
  const snapshot = await loadCategorySnapshotData(categoryId);
  if (!snapshot) return null;

  return {
    cat: snapshot.category as Category,
    appointments: snapshot.appointments.map((a) => ({
      ...a,
      start: new Date(a.start),
      end: new Date(a.end),
    })),
    totalCount: snapshot.totalCount,
  };
}
