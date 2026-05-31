"use client";

/**
 * Portal category detail — doctor/patient read-only; amber glass tone preserved.
 * Admin CRUD lives on `ControlPanelCategoryDetailScreen`.
 */
import { CategoryDetailScreenShared } from "@/components/shared/category-detail/CategoryDetailScreenShared";
import type { UsersListResponse } from "@/hooks/useUsers";
import type { Category, CategorySnapshot } from "@/types/types";

export type CategoryDetailScreenProps = {
  categoryId: string;
  initialCategory: Category | null;
  initialSnapshot: CategorySnapshot | null;
  viewerRole: string | null;
  backHref: string;
  initialDoctorUsers?: UsersListResponse | null;
  initialAdminUsers?: UsersListResponse | null;
};

export function CategoryDetailScreen({
  categoryId,
  initialCategory,
  initialSnapshot,
  viewerRole,
  backHref,
  initialDoctorUsers,
  initialAdminUsers,
}: CategoryDetailScreenProps) {
  return (
    <CategoryDetailScreenShared
      tone="amber"
      mode="portal"
      categoryId={categoryId}
      backHref={backHref}
      viewerRole={viewerRole}
      initialCategory={initialCategory}
      initialSnapshot={initialSnapshot}
      initialDoctorUsers={initialDoctorUsers}
      initialAdminUsers={initialAdminUsers}
    />
  );
}
