"use client";

/**
 * Doctor Management — patient/category list parity: stats, sticky filters, emerald table,
 * View / Edit / Deactivate; Add/Delete/Load-more are demo stubs (API routes documented).
 */

import { type ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  EllipsisVertical,
  Eye,
  ListFilter,
  Pencil,
  Power,
  PowerOff,
  Stethoscope,
  Trash2,
  UserPlus,
} from "lucide-react";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { DemoShowcaseFeatureNote } from "@/components/shared/DemoShowcaseFeatureNote";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { DoctorAvailabilityGroups } from "@/components/shared/doctor-display/DoctorAvailabilityGroups";
import { DoctorDirectoryServiceChips } from "@/components/shared/doctor-display/DoctorDirectoryServiceChips";
import { Button } from "@/components/ui/button";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { DOCTOR_MANAGEMENT_DEMO_NOTE } from "@/lib/demo-showcase-copy";
import {
  doctorManagementStatsStripClass,
  emeraldGlassTableFrameClass,
} from "@/lib/doctor-management-toolbar-classes";
import { ClinicalListFilterToolbar } from "@/components/shared/filters/ClinicalListFilterToolbar";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { APP_INNER_SCROLL_STICKY_TOP_CLASS } from "@/lib/portal-z-index";
import {
  DoctorListFiltersProvider,
  useDoctorListFilters,
  type DoctorAvailabilityFilter,
  type DoctorStatusFilter,
} from "@/components/control-panel/DoctorListFiltersContext";
import { DoctorManagementStatsRow } from "@/components/control-panel/DoctorManagementStatsRow";
import { DoctorMetricsProvider } from "@/context/DoctorMetricsContext";
import { useDoctorListMetrics } from "@/hooks/useDoctorListMetrics";
import { DoctorFormDialog } from "@/components/control-panel/doctor-dialog/DoctorFormDialog";
import {
  doctorFormToUpdatePayload,
  EMPTY_DOCTOR_FORM,
  userToDoctorForm,
  type DoctorFormValues,
} from "@/lib/doctor-form-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import { CpListPaginationDevStub } from "@/components/shared/control-panel/CpListPaginationDevStub";
import { CpDevStubSubmitNote } from "@/components/shared/control-panel/CpDevStubSubmitNote";
import {
  CP_DOCTOR_CREATE_STUB,
  CP_DOCTOR_DELETE_STUB,
  CP_DOCTOR_LIST_PAGINATION_STUB,
} from "@/lib/cp-dev-stub-copy";
import { emeraldGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import type { User } from "@/types/types";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import { useUsers } from "@/hooks/useUsers";
import { useDoctorsDirectory } from "@/hooks/useDoctorsDirectory";
import { CP_DOCTOR_USERS_FILTERS } from "@/lib/control-panel-users-filters";
import { isDoctorActive } from "@/lib/entity-active-status";
import { formatInvoiceMoney } from "@/lib/crud-notify-messages";
import { SPECIALTIES } from "@/lib/doctor-specialty";
import { cn } from "@/lib/utils";
import {
  clinicalCellMutedTextClass,
  clinicalCellPrimaryTextClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";

type DoctorTableRow = User & { directory?: DoctorDirectoryRow };

const STATUS_FILTER_LABEL: Record<DoctorStatusFilter, string> = {
  all: "All Statuses",
  active: "Active",
  inactive: "Inactive",
};

const AVAILABILITY_FILTER_LABEL: Record<DoctorAvailabilityFilter, string> = {
  all: "All Availability",
  with: "With Hours",
  without: "No Hours",
};

function DoctorActions({
  row,
  onEdit,
  onToggleActive,
}: {
  row: DoctorTableRow;
  onEdit: (row: DoctorTableRow) => void;
  onToggleActive: (row: DoctorTableRow) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteStubOpen, setDeleteStubOpen] = useState(false);
  const active = isDoctorActive(row);
  const label = row.display_name?.trim() || row.email;

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
              href={`/control-panel/doctors/${row.id}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              View
            </PrefetchingLink>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onSelect={() => onEdit(row)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              active ? "text-amber-800 focus:text-amber-900" : "text-emerald-800 focus:text-emerald-900"
            )}
            onSelect={() => setConfirmOpen(true)}
          >
            {active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            {active ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer text-rose-800 focus:text-rose-900"
            onSelect={() => setDeleteStubOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmActionDialog
        open={deleteStubOpen}
        onOpenChange={setDeleteStubOpen}
        title="Delete this doctor?"
        subtitle={
          <div className="space-y-2">
            <p>
              <span className="font-medium text-gray-700">{label}</span> — demo uses Deactivate
              instead of hard delete.
            </p>
            <CpDevStubSubmitNote stub={CP_DOCTOR_DELETE_STUB} />
          </div>
        }
        confirmLabel="Delete"
        variant="destructive"
        confirmDisabled
        onConfirm={() => setDeleteStubOpen(false)}
      />
      <ConfirmActionDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={active ? "Deactivate this doctor?" : "Activate this doctor?"}
        subtitle={
          active ? (
            <>
              <span className="font-medium text-gray-700">{label}</span> will stay in lists and
              /services but will not appear as selectable for new appointments.
            </>
          ) : (
            <>
              <span className="font-medium text-gray-700">{label}</span> will become available for
              new appointment bookings again.
            </>
          )
        }
        confirmLabel={active ? "Deactivate" : "Activate"}
        variant={active ? "warning" : "info"}
        onConfirm={() => {
          onToggleActive(row);
          setConfirmOpen(false);
        }}
      />
    </>
  );
}

function DoctorManagementInner() {
  const { data: usersData, isLoading: usersLoading, isError: usersError, updateUser, isUpdating } =
    useUsers(CP_DOCTOR_USERS_FILTERS);
  const {
    data: doctorsData,
    isLoading: doctorsLoading,
    isFetching: doctorsFetching,
    isError: doctorsError,
  } = useDoctorsDirectory();

  const {
    status,
    setStatus,
    specialty,
    setSpecialty,
    availability,
    setAvailability,
    listSearch,
    setListSearch,
    filterDoctors,
    hasActiveFilters,
    resetFilters,
  } = useDoctorListFilters();

  const [listUiMounted, setListUiMounted] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorTableRow | null>(null);
  const [dialogForm, setDialogForm] = useState<DoctorFormValues>(EMPTY_DOCTOR_FORM);
  const [createForm, setCreateForm] = useState<DoctorFormValues>(EMPTY_DOCTOR_FORM);

  useEffect(() => {
    requestAnimationFrame(() => setListUiMounted(true));
  }, []);

  const doctorMap = useMemo(
    () => new Map((doctorsData?.doctors ?? []).map((d) => [d.id, d])),
    [doctorsData?.doctors]
  );

  const mergedRows: DoctorTableRow[] = useMemo(
    () =>
      (usersData?.users ?? []).map((u) => ({
        ...u,
        directory: doctorMap.get(u.id),
      })),
    [usersData?.users, doctorMap]
  );

  const hasCache = mergedRows.length > 0;
  const listBodyLoading = !listUiMounted || ((usersLoading || doctorsLoading) && !hasCache);
  const isError = usersError || doctorsError;
  const metrics = useDoctorListMetrics(mergedRows);

  const filteredRows = useMemo(
    () => filterDoctors(mergedRows),
    [mergedRows, filterDoctors]
  );

  const openEditDialog = useCallback((row: DoctorTableRow) => {
    setEditingDoctor(row);
    setDialogForm(userToDoctorForm(row));
    setEditDialogOpen(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingDoctor) return;
    updateUser({
      id: editingDoctor.id,
      ...doctorFormToUpdatePayload(dialogForm),
    });
    setEditDialogOpen(false);
  }, [editingDoctor, dialogForm, updateUser]);

  const handleToggleActive = useCallback(
    (row: DoctorTableRow) => {
      const nextActive = !isDoctorActive(row);
      updateUser({ id: row.id, is_active: nextActive });
    },
    [updateUser]
  );

  const columns: ColumnDef<DoctorTableRow>[] = useMemo(
    () => [
      {
        id: "display_name",
        accessorFn: (row) => `${row.display_name ?? ""} ${row.email}`.trim(),
        header: ({ column }) => <DataTableColumnHeader column={column} title="Doctor" />,
        meta: { shellClassName: "min-w-[14rem]" },
        cell: ({ row }) => {
          const u = row.original;
          const d = u.directory;
          const active = isDoctorActive(u);
          return (
            <DoctorIdentityRow
              doctor={{
                id: u.id,
                email: u.email,
                display_name: u.display_name,
                image: u.image,
                specialty: d?.specialty ?? u.specialty ?? null,
              }}
              linkKind="admin-cp"
              size="sm"
              showEmail
              showSpecialty
              activeStatus={active}
              className="min-h-[2.75rem]"
            />
          );
        },
      },
      {
        id: "availability",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Available Days" />
        ),
        meta: { shellClassName: "min-w-[11rem]" },
        cell: ({ row }) => {
          const slots = row.original.directory?.availabilities ?? [];
          if (!slots.length) return <span className={clinicalCellMutedTextClass}>—</span>;
          return (
            <DoctorAvailabilityGroups
              availabilities={slots}
              layout="services-card"
              className={clinicalTableCellMinRowClass}
            />
          );
        },
      },
      {
        id: "visit_types",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Visit Types" />,
        meta: { shellClassName: "min-w-[10rem]" },
        cell: ({ row }) => {
          const types = row.original.directory?.bookable_appointment_types ?? [];
          return (
            <DoctorDirectoryServiceChips types={types} showSchedulingMeta={false} />
          );
        },
      },
      {
        id: "patients",
        accessorFn: (row) => row.directory?.patient_count ?? 0,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Patients" />,
        meta: { shellClassName: "w-[5rem] text-center" },
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.original.directory?.patient_count ?? 0}
          </span>
        ),
      },
      {
        id: "revenue",
        accessorFn: (row) => row.directory?.paid_revenue_cents ?? 0,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Revenue" />,
        meta: { shellClassName: "min-w-[7rem]" },
        cell: ({ row }) => {
          const cents = row.original.directory?.paid_revenue_cents ?? 0;
          return (
            <span className={clinicalCellPrimaryTextClass}>
              {formatInvoiceMoney({ amount: cents, currency: "eur", unit: "cents" })}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Actions" className="text-right" />
        ),
        enableSorting: false,
        meta: { shellClassName: "w-[1%] whitespace-nowrap text-right" },
        cell: ({ row }) => (
          <DoctorActions
            row={row.original}
            onEdit={openEditDialog}
            onToggleActive={handleToggleActive}
          />
        ),
      },
    ],
    [openEditDialog, handleToggleActive]
  );

  if (isError) {
    return (
      <div className={controlPanelSectionRootClass}>
        <PageHeader
          title="Doctor Management"
          description="Manage doctor profiles, specialties, and availability."
        />
        <AppSectionErrorBanner>
          Failed to load doctor data. Please refresh the page.
        </AppSectionErrorBanner>
      </div>
    );
  }

  return (
    <DoctorMetricsProvider
      value={{
        rows: mergedRows,
        metrics,
        isLoading: usersLoading || doctorsLoading,
        isFetching: doctorsFetching,
        listBodyLoading,
      }}
    >
      <div className={controlPanelSectionRootClass}>
        <PageHeader
          title="Doctor Management"
          description="Manage doctor profiles, specialties, and availability."
          actions={
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className={cn(emeraldGlassPrimaryButtonClass, "cursor-pointer")}
              onClick={() => {
                setCreateForm(EMPTY_DOCTOR_FORM);
                setCreateDialogOpen(true);
              }}
            >
              <UserPlus className="shrink-0" aria-hidden />
              Add Doctor
            </Button>
          }
        />

        <DemoShowcaseFeatureNote note={DOCTOR_MANAGEMENT_DEMO_NOTE} />

        <div className={doctorManagementStatsStripClass}>
          <DoctorManagementStatsRow />
        </div>

        <ClinicalListFilterToolbar
          stickyClassName={APP_INNER_SCROLL_STICKY_TOP_CLASS}
          search={{
            value: listSearch,
            onChange: setListSearch,
            placeholder: "Search by name, email, or specialty…",
            ariaLabel: "Search doctors by name, email, or specialty",
          }}
          showReset={hasActiveFilters}
          onReset={resetFilters}
        >
          <FilterSelect
            icon={ListFilter}
            value={status}
            onValueChange={(v) => setStatus(v as DoctorStatusFilter)}
            displayLabel={STATUS_FILTER_LABEL[status]}
            size="toolbar"
            triggerClassName="max-w-[200px]"
            ariaLabel="Filter by status"
            options={(["all", "active", "inactive"] as const).map((k) => ({
              value: k,
              label: STATUS_FILTER_LABEL[k],
            }))}
          />
          <FilterSelect
            icon={Stethoscope}
            value={specialty}
            onValueChange={setSpecialty}
            displayLabel={specialty === "all" ? "All Specialties" : specialty}
            size="toolbar"
            triggerClassName="max-w-[220px]"
            ariaLabel="Filter by specialty"
            options={[
              { value: "all", label: "All Specialties" },
              ...SPECIALTIES.map((s) => ({ value: s, label: s })),
            ]}
          />
          <FilterSelect
            icon={CalendarClock}
            value={availability}
            onValueChange={(v) => setAvailability(v as DoctorAvailabilityFilter)}
            displayLabel={AVAILABILITY_FILTER_LABEL[availability]}
            size="toolbar"
            triggerClassName="max-w-[220px]"
            ariaLabel="Filter by availability"
            options={(["all", "with", "without"] as const).map((k) => ({
              value: k,
              label: AVAILABILITY_FILTER_LABEL[k],
            }))}
          />
        </ClinicalListFilterToolbar>

        <DataTable<DoctorTableRow, unknown>
          columns={columns}
          data={filteredRows}
          isLoading={listBodyLoading}
          externalGlobalFilter={{ value: listSearch, onChange: setListSearch }}
          globalFilterFn={(row, q) => {
            const s = q.trim().toLowerCase();
            if (!s) return true;
            const u = row;
            const d = u.directory;
            return (
              (u.display_name?.toLowerCase().includes(s) ?? false) ||
              u.email.toLowerCase().includes(s) ||
              (d?.specialty?.toLowerCase().includes(s) ?? false) ||
              (u.specialty?.toLowerCase().includes(s) ?? false)
            );
          }}
          emptyMessage="No doctors match your filters."
          tableClassName="min-w-[1100px] w-full"
          tableLayout="auto"
          tableFrameClassName={emeraldGlassTableFrameClass}
        />

        <CpListPaginationDevStub
          stub={CP_DOCTOR_LIST_PAGINATION_STUB}
          visibleCount={filteredRows.length}
          pagination={usersData?.pagination ?? null}
        />

        {editingDoctor ? (
          <DoctorFormDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            readOnlyEmail={editingDoctor.email}
            form={dialogForm}
            onFormChange={(patch) => setDialogForm((p) => ({ ...p, ...patch }))}
            onSubmit={handleSaveEdit}
            isSubmitting={isUpdating}
            mode="edit"
          />
        ) : null}

        <DoctorFormDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          readOnlyEmail="new.doctor@example.com"
          form={createForm}
          onFormChange={(patch) => setCreateForm((p) => ({ ...p, ...patch }))}
          onSubmit={() => undefined}
          mode="create"
          devStub={CP_DOCTOR_CREATE_STUB}
        />
      </div>
    </DoctorMetricsProvider>
  );
}

export default function DoctorManagement() {
  return (
    <DoctorListFiltersProvider>
      <DoctorManagementInner />
    </DoctorListFiltersProvider>
  );
}
