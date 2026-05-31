"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeft,
  Calendar,
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
import { useRouter } from "next/navigation";
import { useLayoutEffect, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { CategoryFormDialog } from "@/components/control-panel/category-dialog/CategoryFormDialog";
import { ClinicalDataTable } from "@/components/shared/ClinicalDataTable";
import { CategoryBrandMark } from "@/components/shared/category-display/CategoryBrandMark";
import { EntityDetailRecordAuditCard } from "@/components/shared/entity-detail/EntityDetailRecordAuditCard";
import { buildRelatedAppointmentsColumns } from "@/components/control-panel/patient-detail-snapshot-columns";
import { useCategories, useCategory, useCategorySnapshot } from "@/hooks/useCategories";
import { useUsers } from "@/hooks/useUsers";
import type { UsersListResponse } from "@/hooks/useUsers";
import { buildStaffDirectoryMap } from "@/lib/staff-directory-cache";
import { seedUsersListCache } from "@/lib/ssr-query-seed";
import { invalidateQueriesForRoute } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import {
  patientDetailDefinitionRowClass,
  patientDetailSchemaSectionClass,
  patientDetailSnapshotTableFrameClass,
  patientDetailDefinitionListClass,
  entityDetailPageHeaderClass,
} from "@/lib/patient-detail-ui-classes";
import {
  CATEGORY_DETAIL_ADMIN_USERS_FILTERS,
  CATEGORY_DETAIL_DOCTOR_USERS_FILTERS,
  resolveCategoryDetailToneClasses,
  type CategoryDetailTone,
} from "@/lib/category-detail-ui-classes";
import {
  EMPTY_CATEGORY_FORM,
  categoryToFormInput,
} from "@/lib/category-form-state";
import type { CategoryCreateInput } from "@/hooks/useCategories";
import { isCategoryActive } from "@/lib/entity-active-status";
import { cn } from "@/lib/utils";
import {
  resolveEntityDetailRootClass,
  type AppSectionScrollShell,
} from "@/lib/section-page-layout";
import {
  CATEGORY_DETAIL_RELATED_APPOINTMENTS_HIDDEN_COLUMNS,
  resolveClinicalSnapshotAppointmentsTableMinWidth,
} from "@/lib/clinical-snapshot-table-columns";
import type { Category, CategorySnapshot } from "@/types/types";
import type { EntityRole } from "@/lib/entity-routes";
import { clinicalEmptyOr } from "@/components/shared/ClinicalTableEmptyDash";

export type CategoryDetailScreenMode = "control-panel" | "portal";

export type CategoryDetailScreenSharedProps = {
  tone: CategoryDetailTone;
  mode: CategoryDetailScreenMode;
  categoryId: string;
  backHref: string;
  viewerRole: string | null;
  initialCategory: Category | null;
  initialSnapshot: CategorySnapshot | null;
  initialDoctorUsers?: UsersListResponse | null;
  initialAdminUsers?: UsersListResponse | null;
};

function FieldLabel({
  icon: Icon,
  iconCircleClass,
  iconClass,
  children,
}: {
  icon: LucideIcon;
  iconCircleClass: string;
  iconClass: string;
  children: React.ReactNode;
}) {
  return (
    <dt className="flex items-center gap-1.5 text-xs font-medium text-gray-500 sm:pt-0.5">
      <span className={iconCircleClass}>
        <Icon className={iconClass} aria-hidden />
      </span>
      {children}
    </dt>
  );
}

function DefinitionRow({
  icon,
  label,
  children,
  toneClasses,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  toneClasses: ReturnType<typeof resolveCategoryDetailToneClasses>;
}) {
  return (
    <div className={patientDetailDefinitionRowClass}>
      <FieldLabel
        icon={icon}
        iconCircleClass={toneClasses.fieldIconCircleClass}
        iconClass={toneClasses.fieldIconClass}
      >
        {label}
      </FieldLabel>
      <dd className="min-w-0 text-gray-700">{children}</dd>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  children,
  toneClasses,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  toneClasses: ReturnType<typeof resolveCategoryDetailToneClasses>;
}) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
      <span className={toneClasses.sectionIconCircleClass}>
        <Icon className={toneClasses.sectionIconClass} aria-hidden />
      </span>
      {children}
    </h3>
  );
}

function CategoryDetailBodySkeleton({
  toneClasses,
}: {
  toneClasses: ReturnType<typeof resolveCategoryDetailToneClasses>;
}) {
  return (
    <dl className={patientDetailDefinitionListClass}>
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2">
        <Skeleton className="h-5 w-full max-w-[560px] rounded-md" />
        <Skeleton className="mt-1 h-5 w-full max-w-[560px] rounded-md" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={patientDetailDefinitionRowClass}>
          <Skeleton className={cn("h-6 w-28 rounded-full", toneClasses.fieldIconCircleClass)} />
          <Skeleton className="h-5 w-full max-w-xs rounded-md" />
        </div>
      ))}
    </dl>
  );
}

/**
 * Shared category detail — CP (sky + CRUD) and portal (amber + read-only) use the same layout/table.
 */
export function CategoryDetailScreenShared({
  tone,
  mode,
  categoryId,
  backHref,
  viewerRole,
  initialCategory,
  initialSnapshot,
  initialDoctorUsers,
  initialAdminUsers,
}: CategoryDetailScreenSharedProps) {
  const toneClasses = resolveCategoryDetailToneClasses(tone);
  const scrollShell: AppSectionScrollShell =
    mode === "control-panel" ? "control-panel" : "portal";
  const isAdminMode = mode === "control-panel";
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

  useLayoutEffect(() => {
    if (initialDoctorUsers != null) {
      seedUsersListCache(queryClient, CATEGORY_DETAIL_DOCTOR_USERS_FILTERS, initialDoctorUsers);
    }
    if (initialAdminUsers != null) {
      seedUsersListCache(queryClient, CATEGORY_DETAIL_ADMIN_USERS_FILTERS, initialAdminUsers);
    }
  }, [queryClient, initialDoctorUsers, initialAdminUsers]);

  const { data: doctorUsers } = useUsers(CATEGORY_DETAIL_DOCTOR_USERS_FILTERS);
  const { data: adminUsers } = useUsers(CATEGORY_DETAIL_ADMIN_USERS_FILTERS);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const cat = liveCategory ?? initialCategory;
  const hasCategory = cat != null;
  const showBodySkeleton = !hasCategory && (isLoading || !isMounted);
  const showLiveBody = hasCategory && isMounted;

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
  const entityRole = (viewerRole ?? (isAdminMode ? "admin" : "doctor")) as EntityRole;

  const snapshot = liveSnapshot ?? initialSnapshot;
  const hasSnapshot = snapshot != null;
  const appointmentsLoading =
    !isMounted || ((snapshotLoading || snapshotFetching) && !hasSnapshot);
  const appointmentList = snapshot?.appointments ?? [];
  const totalCount = snapshot?.totalCount ?? 0;

  const staffById = useMemo(
    () =>
      buildStaffDirectoryMap({
        doctorUsers: doctorUsers?.users ?? null,
        adminUsers: adminUsers?.users ?? null,
      }),
    [doctorUsers?.users, adminUsers?.users]
  );

  const appointmentColumns = useMemo(
    () =>
      buildRelatedAppointmentsColumns({
        viewerRole: entityRole,
        patientDisplayName: "—",
        staffById,
        hiddenColumns: CATEGORY_DETAIL_RELATED_APPOINTMENTS_HIDDEN_COLUMNS,
      }),
    [entityRole, staffById]
  );

  const appointmentTableMinWidthClass = useMemo(
    () =>
      resolveClinicalSnapshotAppointmentsTableMinWidth(
        CATEGORY_DETAIL_RELATED_APPOINTMENTS_HIDDEN_COLUMNS
      ),
    []
  );

  if (!cat && !showBodySkeleton && !isLoading && isMounted) {
    return null;
  }

  return (
    <div className={resolveEntityDetailRootClass(scrollShell)}>
      <PageHeader
        className={entityDetailPageHeaderClass}
        title={showLiveBody && cat ? cat.label : <Skeleton className="h-7 w-56 max-w-full" aria-hidden />}
        description="Category Record — Schema Fields, Related Appointments"
        actions={
          <BackNavigationLink
            href={backHref}
            className={cn(toneClasses.backButtonClass, "no-underline")}
          >
            <ArrowLeft className="shrink-0" aria-hidden />
            Back
          </BackNavigationLink>
        }
      />

      <Card
        className={cn(
          "flex-1 bg-white/90 text-gray-700",
          toneClasses.cardBorderClass,
          toneClasses.cardFrameClass
        )}
      >
        <CardContent className="space-y-3 px-4 sm:px-6 text-gray-700">
          <div className="min-h-6">
            <h2 className="text-lg font-semibold text-gray-700">Category Details</h2>
          </div>

          <div className={patientDetailSchemaSectionClass}>
            <div className="flex items-center gap-2">
              {showLiveBody && cat ? (
                <CategoryBrandMark
                  color={cat.color}
                  icon={cat.icon}
                  variant="brand"
                  size="hero"
                  className="shrink-0"
                />
              ) : (
                <Skeleton className="h-16 w-16 shrink-0 rounded-full" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                {showLiveBody && cat ? (
                  <>
                    <p className="text-lg font-semibold text-gray-700">
                      {clinicalEmptyOr(cat.label, "definition")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {clinicalEmptyOr(cat.description, "definition")}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          active
                            ? "border-emerald-200 bg-emerald-50 text-xs font-normal text-emerald-800"
                            : "border-slate-200 bg-slate-50 text-xs font-normal text-gray-700"
                        }
                      >
                        {active ? "Active" : "Inactive"}
                      </Badge>
                      {cat.duration_minutes_default != null ? (
                        <Badge variant="outline" className={toneClasses.durationBadgeClass}>
                          {cat.duration_minutes_default} min default
                        </Badge>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <div>
                    <Skeleton className="h-7 w-40 rounded-md" />
                    <Skeleton className="h-5 w-52 rounded-md" />
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {showBodySkeleton ? (
              <CategoryDetailBodySkeleton toneClasses={toneClasses} />
            ) : cat ? (
              <dl className={patientDetailDefinitionListClass}>
                <EntityDetailRecordAuditCard
                  createdAt={cat.created_at}
                  updatedAt={cat.updated_at}
                  createdBy={
                    cat.created_by_display
                      ? {
                          userId: cat.created_by_id,
                          label: cat.created_by_display,
                          email: cat.created_by_email,
                        }
                      : null
                  }
                  updatedBy={
                    cat.updated_by_display
                      ? {
                          userId: cat.updated_by_id,
                          label: cat.updated_by_display,
                          email: cat.updated_by_email,
                        }
                      : null
                  }
                  viewerRole={entityRole}
                  iconCircleClass={toneClasses.fieldIconCircleClass}
                  iconClassName={toneClasses.fieldIconClass}
                />

                <DefinitionRow icon={Tag} label="Label" toneClasses={toneClasses}>
                  <div className="flex items-center gap-2">
                    <CategoryBrandMark color={cat.color} icon={cat.icon} variant="brand" size="compact" />
                    <span className="font-semibold">{cat.label}</span>
                  </div>
                </DefinitionRow>
                <DefinitionRow icon={Layers} label="Description" toneClasses={toneClasses}>
                  {cat.description?.trim() ? cat.description : "—"}
                </DefinitionRow>
                {cat.icon ? (
                  <DefinitionRow icon={Sparkles} label="Icon" toneClasses={toneClasses}>
                    {cat.icon}
                  </DefinitionRow>
                ) : null}
                <DefinitionRow icon={Hash} label="ID" toneClasses={toneClasses}>
                  <span className="font-mono text-xs break-all">{cat.id}</span>
                </DefinitionRow>
                <DefinitionRow icon={Activity} label="Status" toneClasses={toneClasses}>
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
                <DefinitionRow icon={Clock} label="Default Duration" toneClasses={toneClasses}>
                  {cat.duration_minutes_default != null
                    ? `${cat.duration_minutes_default} minutes`
                    : "—"}
                </DefinitionRow>
                <DefinitionRow icon={Hash} label="Sort Order" toneClasses={toneClasses}>
                  {cat.sort_order ?? 0}
                </DefinitionRow>
              </dl>
            ) : null}

            <div className={cn("space-y-3 border-t pt-3", toneClasses.sectionDividerClass)}>
              <SectionHeading icon={Calendar} toneClasses={toneClasses}>
                Related Appointments
                <Badge variant="outline" className="ml-1 font-bold">
                  {totalCount}
                </Badge>
              </SectionHeading>
              <ClinicalDataTable
                columns={appointmentColumns}
                data={appointmentList}
                isLoading={appointmentsLoading}
                pagination={false}
                emptyMessage="No appointments use this category yet."
                tableClassName={appointmentTableMinWidthClass}
                className={patientDetailSnapshotTableFrameClass}
                tableFrameClassName="rounded-md border border-slate-200/80 bg-white shadow-none"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className={toneClasses.stickyFooterClass}>
        <BackNavigationLink
          href={backHref}
          className={cn(toneClasses.backButtonClass, "no-underline")}
        >
          <List className="shrink-0" aria-hidden />
          Back To List
        </BackNavigationLink>
        {isAdminMode && hasCategory ? (
          <div className="flex flex-wrap gap-2">
              <ControlPanelGlassActionButton type="button" variant="emerald" onClick={openEditDialog}>
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
                      await invalidateQueriesForRoute(queryClient, backHref);
                      router.push(backHref);
                    },
                  });
                }}
              />
            </div>
          ) : null}
      </div>

      {isAdminMode && hasCategory ? (
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
