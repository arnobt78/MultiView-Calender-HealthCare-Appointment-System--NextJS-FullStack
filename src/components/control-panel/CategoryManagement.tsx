"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { useCategories, type CategoryCreateInput } from "@/hooks/useCategories";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { CategoryTableCell } from "@/components/control-panel/patient-detail-snapshot-columns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EntityActiveStatusBadge } from "@/components/shared/entity-display/EntityActiveStatusBadge";
import { Category } from "@/types/types";
import { cn } from "@/lib/utils";
import { violetGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import {
  amberGlassTableFrameClass,
  categoryManagementFilterToolbarClass,
  categoryManagementStatsStripClass,
} from "@/lib/category-management-toolbar-classes";
import { GlassResetFilterButton } from "@/components/shared/GlassResetFilterButton";
import { EntityListSearchInput } from "@/components/shared/EntityListSearchInput";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
  Clock,
  EllipsisVertical,
  Eye,
  ListFilter,
  Pencil,
  Tag,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { APP_NAVBAR_STICKY_OFFSET_CLASS } from "@/lib/portal-z-index";
import {
  CategoryListFiltersProvider,
  useCategoryListFilters,
  type CategoryStatusFilter,
} from "@/components/control-panel/CategoryListFiltersContext";
import { CategoryManagementStatsRow } from "@/components/control-panel/CategoryManagementStatsRow";
import { CategoryMetricsProvider } from "@/context/CategoryMetricsContext";
import { useCategoryListMetrics } from "@/hooks/useCategoryListMetrics";
import { CategoryFormDialog } from "@/components/control-panel/category-dialog/CategoryFormDialog";
import {
  EMPTY_CATEGORY_FORM,
  buildCategorySubmitPayload,
  categoryToFormInput,
} from "@/lib/category-form-state";
import { isCategoryActive } from "@/lib/entity-active-status";
import { CLINICAL_EMPTY_EM_DASH } from "@/lib/clinical-empty-value";
import {
  clinicalCellMutedTextClass,
  clinicalTableCellMinRowClass,
  clinicalTableBrandMarkCellClass,
  clinicalBadgeInlineClass,
  clinicalBadgeInlineIconClass,
} from "@/lib/table-display-styles";

const STATUS_FILTER_LABEL: Record<CategoryStatusFilter, string> = {
  all: "All Statuses",
  active: "Active",
  inactive: "Inactive",
};

function CategoryActions({
  category,
  onDelete,
  onEdit,
}: {
  category: Category;
  onDelete: (c: Category) => void;
  onEdit: (c: Category) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <EllipsisVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <PrefetchingLink
              href={`/control-panel/categories/${category.id}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              View
            </PrefetchingLink>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onSelect={() => onEdit(category)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive flex items-center gap-2"
            onSelect={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Permanently remove this category?"
        subtitle={
          <>
            This will delete{" "}
            <span className="font-medium text-gray-700">&ldquo;{category.label}&rdquo;</span>.
            Appointments using this category may need reassignment. You cannot undo this action.
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          onDelete(category);
          setConfirmOpen(false);
        }}
      />
    </>
  );
}

export function CategoryManagementInner() {
  const {
    categories,
    isLoading,
    isFetching,
    isError,
    createCategory,
    isCreating,
    updateCategory,
    isUpdating,
    deleteCategory,
  } = useCategories();

  const [listUiMounted, setListUiMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setListUiMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const hasCategoriesCache = categories.length > 0;
  const listBodyLoading = !listUiMounted || (isLoading && !hasCategoriesCache);

  const { status, setStatus, filterByStatus } = useCategoryListFilters();
  const filteredCategories = filterByStatus(categories);
  const metrics = useCategoryListMetrics(categories);

  const [listSearch, setListSearch] = useState("");
  const hasToolbarFilters = useMemo(
    () => listSearch.trim().length > 0 || status !== "all",
    [listSearch, status]
  );
  const resetToolbar = () => {
    setListSearch("");
    setStatus("all");
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryCreateInput>(EMPTY_CATEGORY_FORM);

  const resetDialog = () => {
    setDialogMode("create");
    setEditingCategory(null);
    setForm(EMPTY_CATEGORY_FORM);
  };

  const openCreateDialog = () => {
    resetDialog();
    setDialogOpen(true);
  };

  const openEditDialog = useCallback((category: Category) => {
    setDialogMode("edit");
    setEditingCategory(category);
    setForm(categoryToFormInput(category));
    setDialogOpen(true);
  }, []);

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetDialog();
  };

  const handleDialogSubmit = () => {
    const payload = buildCategorySubmitPayload(form);
    if (dialogMode === "create") {
      createCategory(payload, {
        onSuccess: () => handleDialogOpenChange(false),
      });
    } else if (editingCategory) {
      updateCategory(
        { id: editingCategory.id, ...payload },
        { onSuccess: () => handleDialogOpenChange(false) }
      );
    }
  };

  const columns: ColumnDef<Category>[] = useMemo(
    () => [
      {
        accessorKey: "label",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Label" />,
        meta: {
          shellClassName:
            "w-[22%] min-w-[12rem] max-w-[20rem] whitespace-normal overflow-visible",
        },
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div
              className={cn(
                clinicalTableCellMinRowClass,
                clinicalTableBrandMarkCellClass
              )}
            >
              <CategoryTableCell
                label={c.label}
                color={c.color}
                icon={c.icon}
                categoryId={c.id}
                viewerRole="admin"
                markVariant="brand"
              />
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
        meta: {
          shellClassName:
            "w-[28%] min-w-[12rem] whitespace-normal break-words [overflow-wrap:anywhere]",
        },
        cell: ({ row }) => (
          <div className="flex min-h-[2.75rem] min-w-0 items-center">
            <span
              className={cn(
                "line-clamp-3 min-w-0 break-words [overflow-wrap:anywhere]",
                clinicalCellMutedTextClass
              )}
              title={row.original.description ?? undefined}
            >
              {row.original.description?.trim() ? row.original.description.trim() : CLINICAL_EMPTY_EM_DASH}
            </span>
          </div>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => (isCategoryActive(row) ? "active" : "inactive"),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        meta: { shellClassName: "w-[10%] min-w-[7.25rem] whitespace-nowrap" },
        cell: ({ row }) => {
          const active = isCategoryActive(row.original);
          return (
            <div className="flex min-h-[2.75rem] items-center">
              <EntityActiveStatusBadge active={active} />
            </div>
          );
        },
      },
      {
        id: "duration",
        accessorFn: (row) => row.duration_minutes_default ?? -1,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Default Duration" />
        ),
        meta: { shellClassName: "w-[12%] min-w-[9rem] whitespace-nowrap" },
        cell: ({ row }) => {
          const d = row.original.duration_minutes_default;
          return (
            <div className="flex min-h-[2.75rem] min-w-0 items-center">
              {d != null ? (
                <Badge
                  variant="outline"
                  className={cn(
                    clinicalBadgeInlineClass,
                    "bg-sky-50 text-sky-700 border-sky-200"
                  )}
                >
                  <Clock className={clinicalBadgeInlineIconClass} />
                  {d} min
                </Badge>
              ) : (
                <span className={clinicalCellMutedTextClass}>{CLINICAL_EMPTY_EM_DASH}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
        meta: { shellClassName: "w-[13.5%] min-w-[9rem] whitespace-nowrap" },
        cell: ({ row }) => (
          <div className="flex min-h-[2.75rem] items-center">
            <span className={cn("whitespace-nowrap", clinicalCellMutedTextClass)}>
              {row.original.created_at
                ? format(new Date(row.original.created_at), "MMM d, yyyy")
                : "—"}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Actions" className="text-right" />
        ),
        enableSorting: false,
        meta: { shellClassName: "w-[8%] min-w-[4.75rem] whitespace-nowrap text-right" },
        cell: ({ row }) => (
          <div className="flex min-h-[2.75rem] items-center justify-end">
            <CategoryActions
              category={row.original}
              onEdit={openEditDialog}
              onDelete={(c) => deleteCategory(c.id)}
            />
          </div>
        ),
      },
    ],
    [deleteCategory, openEditDialog]
  );

  if (isError) {
    return (
      <div className={controlPanelSectionRootClass}>
        <PageHeader
          title="Category Management"
          description="Manage appointment categories with status, duration, and display order."
        />
        <AppSectionErrorBanner>
          Failed to load categories. Please refresh the page.
        </AppSectionErrorBanner>
      </div>
    );
  }

  const metricsValue = {
    categories,
    metrics,
    isLoading,
    isFetching,
    listBodyLoading,
  };

  return (
    <CategoryMetricsProvider value={metricsValue}>
      <div className={controlPanelSectionRootClass}>
        <PageHeader
          title="Category Management"
          description="Manage appointment categories with status, duration, and display order."
          actions={
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className={cn(violetGlassPrimaryButtonClass, "cursor-pointer")}
              onClick={openCreateDialog}
            >
              <Tag className="shrink-0" aria-hidden />
              Add Category
            </Button>
          }
        />

        <div className={categoryManagementStatsStripClass}>
          <CategoryManagementStatsRow />
        </div>

        <div
          className={cn(
            categoryManagementFilterToolbarClass,
            APP_NAVBAR_STICKY_OFFSET_CLASS
          )}
        >
          <EntityListSearchInput
            value={listSearch}
            onChange={setListSearch}
            placeholder="Search… (label or description)"
            ariaLabel="Search categories by label or description"
          />
          <FilterSelect
            value={status}
            onValueChange={(v) => setStatus(v as CategoryStatusFilter)}
            displayLabel={STATUS_FILTER_LABEL[status]}
            icon={ListFilter}
            size="toolbar"
            triggerClassName="max-w-[200px]"
            ariaLabel="Filter by status"
            options={[
              { value: "all", label: "All Statuses" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
          {hasToolbarFilters ? (
            <GlassResetFilterButton
              onClick={resetToolbar}
              className="ml-auto h-10 shrink-0 px-4 [&_svg]:size-4"
            />
          ) : null}
        </div>

        <DataTable<Category, unknown>
          columns={columns}
          data={filteredCategories}
          isLoading={listBodyLoading}
          globalFilterFn={(row, q) => {
            const s = q.trim().toLowerCase();
            if (!s) return true;
            const c = row;
            return `${c.label} ${c.description ?? ""}`.toLowerCase().includes(s);
          }}
          externalGlobalFilter={{ value: listSearch, onChange: setListSearch }}
          searchPlaceholder="Search by label or description…"
          emptyMessage="No categories match your filters."
          tableClassName="min-w-[980px] w-full"
          tableFrameClassName={amberGlassTableFrameClass}
        />

        <CategoryFormDialog
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
          mode={dialogMode}
          form={form}
          onFormChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onSubmit={handleDialogSubmit}
          isSubmitting={dialogMode === "create" ? isCreating : isUpdating}
        />
      </div>
    </CategoryMetricsProvider>
  );
}

/** Control-panel category list — SSR-seeded via dedicated `/control-panel/category-management` route. */
export default function CategoryManagement() {
  return (
    <CategoryListFiltersProvider>
      <CategoryManagementInner />
    </CategoryListFiltersProvider>
  );
}
