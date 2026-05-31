"use client";

import { CategoryDetailScreenShared } from "@/components/shared/category-detail/CategoryDetailScreenShared";
import type { UsersListResponse } from "@/hooks/useUsers";
import type { Category, CategorySnapshot } from "@/types/types";

export type ControlPanelCategoryDetailScreenProps = {
  categoryId: string;
  listBackHref: string;
  viewerRole: string | null;
  initialCategory: Category | null;
  initialSnapshot: CategorySnapshot | null;
  initialDoctorUsers?: UsersListResponse | null;
  initialAdminUsers?: UsersListResponse | null;
};

/** Admin CP category detail — sky tone + CRUD footer. */
export function ControlPanelCategoryDetailScreen(props: ControlPanelCategoryDetailScreenProps) {
  return (
    <CategoryDetailScreenShared
      tone="sky"
      mode="control-panel"
      categoryId={props.categoryId}
      backHref={props.listBackHref}
      viewerRole={props.viewerRole}
      initialCategory={props.initialCategory}
      initialSnapshot={props.initialSnapshot}
      initialDoctorUsers={props.initialDoctorUsers}
      initialAdminUsers={props.initialAdminUsers}
    />
  );
}
