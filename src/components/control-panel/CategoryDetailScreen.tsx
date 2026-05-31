"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CalendarDays,
  CheckCircle2,
  CircleOff,
  Clock,
  Hash,
  Layers,
  List,
  Pencil,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useLayoutEffect, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { CategoryFormDialog } from "@/components/control-panel/category-dialog/CategoryFormDialog";
import { useCategories, useCategory, useCategorySnapshot } from "@/hooks/useCategories";
import { appointmentDetailHref } from "@/lib/entity-routes";
import { invalidateQueriesForRoute } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { violetGlassBackButtonClass } from "@/lib/calendar-header-action-styles";
import {
  patientDetailDefinitionRowClass,
  patientDetailSchemaSectionClass,
  patientDetailStickyFooterClass,
} from "@/lib/patient-detail-ui-classes";
import {
  EMPTY_CATEGORY_FORM,
  categoryToFormInput,
} from "@/lib/category-form-state";
import type { CategoryCreateInput } from "@/hooks/useCategories";
import { isCategoryActive } from "@/lib/entity-active-status";
import { cn } from "@/lib/utils";
import { appEntityDetailRootClass } from "@/lib/section-page-layout";
import type { Category, CategorySnapshot } from "@/types/types";

export type ControlPanelCategoryDetailScreenProps = {
  categoryId: string;
  listBackHref: string;
  viewerRole: string | null;
  initialCategory: Category | null;
  initialSnapshot: CategorySnapshot | null;
};

function FieldLabel({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500 sm:pt-0.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-violet-200/70 bg-violet-50/80 shadow-[0_2px_8px_rgba(139,92,246,0.15)]">
        <Icon className="h-3 w-3 text-violet-600" aria-hidden />
      </span>
      {children}
    </dt>
  );
}

function DefinitionRow({
  icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className={patientDetailDefinitionRowClass}>
      <FieldLabel icon={icon}>{label}</FieldLabel>
      <dd className="min-w-0 text-gray-700">{children}</dd>
    </div>
  );
}

function CategoryDetailBodySkeleton() {
  return (
    <dl className={cn(patientDetailSchemaSectionClass, "space-y-3")}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={patientDetailDefinitionRowClass}>
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-5 w-full max-w-xs rounded-md" />
        </div>
      ))}
    </dl>
  );
}

/**
 * Admin category detail — SSR seeds category cache; chrome mounted, value slots pulse only.
 */
export function ControlPanelCategoryDetailScreen({
  categoryId,
  listBackHref,
  viewerRole,
  initialCategory,
  initialSnapshot,
}: ControlPanelCategoryDetailScreenProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { updateCategory, isUpdating, deleteCategory, isDeleting } = useCategories();
  const { data: liveCategory, isLoading } = useCategory(categoryId);
  const {
    data: liveSnapshot,
    isLoading: snapshotLoading,
    isFetching: snapshotFetching,
  } = useCategorySnapshot(categoryId, { initialData: initialSnapshot ?? undefined });

  useLayoutEffect(() => {
    if (initialCategory != null) {
      queryClient.setQueryData(queryKeys.categories.detail(categoryId), initialCategory);
    }
  }, [queryClient, categoryId, initialCategory]);

  useLayoutEffect(() => {
    if (initialSnapshot != null) {
      queryClient.setQueryData(queryKeys.categories.snapshot(categoryId), initialSnapshot);
    }
  }, [queryClient, categoryId, initialSnapshot]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const cat = liveCategory ?? initialCategory;
  const hasCategory = cat != null;
  const showBodySkeleton = !hasCategory && (isLoading || !isMounted);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [dialogForm, setDialogForm] = useState<CategoryCreateInput>(EMPTY_CATEGORY_FORM);

  const openEditDialog = () => {
    if (!cat) return;
    setDialogForm(categoryToFormInput(cat));
    setEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (!cat) return;
    updateCategory(
      {
        id: cat.id,
        ...dialogForm,
        label: dialogForm.label.trim(),
        description: dialogForm.description?.trim() || undefined,
        icon: dialogForm.icon?.trim() || undefined,
      },
      { onSuccess: () => setEditDialogOpen(false) }
    );
  };

  const active = cat ? isCategoryActive(cat) : false;

  const snapshot = liveSnapshot ?? initialSnapshot;
  const hasSnapshot = snapshot != null;
  const appointmentsLoading =
    !isMounted || ((snapshotLoading || snapshotFetching) && !hasSnapshot);
  const appointmentList = snapshot?.appointments ?? [];
  const totalCount = snapshot?.totalCount ?? 0;

  return (
    <div className={appEntityDetailRootClass}>
      <PageHeader
        title={cat?.label ?? "Category"}
        description="Category details and associated appointments"
      />

      <Card className="rounded-[28px] border border-violet-200/40 bg-white/95 shadow-[0_24px_60px_rgba(139,92,246,0.12)]">
        <CardContent className="p-5 space-y-6">
          {showBodySkeleton ? (
            <CategoryDetailBodySkeleton />
          ) : cat ? (
            <dl className={cn(patientDetailSchemaSectionClass, "space-y-3")}>
              <DefinitionRow icon={Tag} label="Label">
                <div className="flex items-center gap-2">
                  {cat.color ? (
                    <span
                      className="h-8 w-8 rounded-xl border shrink-0"
                      style={{ background: cat.color }}
                    />
                  ) : null}
                  <span className="font-semibold">{cat.label}</span>
                </div>
              </DefinitionRow>
              <DefinitionRow icon={Layers} label="Description">
                {cat.description?.trim() ? cat.description : "—"}
              </DefinitionRow>
              {cat.icon ? (
                <DefinitionRow icon={Sparkles} label="Icon">
                  {cat.icon}
                </DefinitionRow>
              ) : null}
              <DefinitionRow icon={Hash} label="ID">
                <span className="font-mono text-xs break-all">{cat.id}</span>
              </DefinitionRow>
              <DefinitionRow icon={Activity} label="Status">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] py-0 gap-0.5",
                    active
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  )}
                >
                  {active ? (
                    <CheckCircle2 className="h-2.5 w-2.5" />
                  ) : (
                    <CircleOff className="h-2.5 w-2.5" />
                  )}
                  {active ? "Active" : "Inactive"}
                </Badge>
              </DefinitionRow>
              <DefinitionRow icon={Clock} label="Default Duration">
                {cat.duration_minutes_default != null
                  ? `${cat.duration_minutes_default} minutes`
                  : "—"}
              </DefinitionRow>
              <DefinitionRow icon={Hash} label="Sort Order">
                {cat.sort_order ?? 0}
              </DefinitionRow>
            </dl>
          ) : null}

          <div className="space-y-3 border-t border-violet-100/80 pt-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <CalendarDays className="h-4 w-4 text-violet-600" />
              Appointments
              <Badge variant="outline" className="ml-1 font-bold">
                {totalCount}
              </Badge>
            </h3>
            {appointmentsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : appointmentList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No appointments use this category yet.
              </p>
            ) : (
              <div className="space-y-2">
                {appointmentList.map((appt) => (
                  <Link
                    key={appt.id}
                    href={appointmentDetailHref(viewerRole, appt.id)}
                    className="flex items-center justify-between rounded-lg border bg-violet-50/40 hover:bg-violet-100/50 px-3 py-2 text-xs transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{appt.title}</p>
                      <p className="text-muted-foreground">
                        {appt.owner.display_name ?? appt.owner.email} ·{" "}
                        {format(new Date(appt.start), "dd MMM yyyy, HH:mm")}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] py-0 ml-2 shrink-0 capitalize">
                      {appt.status ?? "pending"}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className={patientDetailStickyFooterClass}>
        <div className="flex min-h-10 flex-wrap items-center justify-between gap-2">
          <BackNavigationLink
            href={listBackHref}
            className={cn(violetGlassBackButtonClass, "no-underline")}
          >
            <List className="shrink-0" aria-hidden />
            Back To List
          </BackNavigationLink>
          {hasCategory ? (
            <div className="flex flex-wrap gap-2">
              <ControlPanelGlassActionButton type="button" variant="violet" onClick={openEditDialog}>
                <Pencil className="shrink-0" aria-hidden />
                Update Category
              </ControlPanelGlassActionButton>
              <ConfirmActionDialog
                trigger={
                  <ControlPanelGlassActionButton type="button" variant="rose" disabled={isDeleting}>
                    <Trash2 className="shrink-0" aria-hidden />
                    {isDeleting ? "Deleting…" : "Delete"}
                  </ControlPanelGlassActionButton>
                }
                title="Permanently remove this category?"
                subtitle={
                  <>
                    This will delete{" "}
                    <span className="text-gray-700">&ldquo;{cat?.label}&rdquo;</span>. You cannot
                    undo this action.
                  </>
                }
                confirmLabel="Delete"
                onConfirm={() => {
                  if (!cat) return;
                  deleteCategory(cat.id, {
                    onSuccess: async () => {
                      await invalidateQueriesForRoute(queryClient, listBackHref);
                      router.push(listBackHref);
                    },
                  });
                }}
              />
            </div>
          ) : null}
        </div>
      </div>

      {hasCategory ? (
        <CategoryFormDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          mode="edit"
          form={dialogForm}
          onFormChange={(patch) => setDialogForm((prev) => ({ ...prev, ...patch }))}
          onSubmit={handleEditSubmit}
          isSubmitting={isUpdating}
        />
      ) : null}
    </div>
  );
}
