"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { usePatients } from "@/hooks/usePatients";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { PatientIdentityCell } from "@/components/shared/person-display/PatientIdentityCell";
import {
  clinicalCellMutedTextClass,
  clinicalCellPrimaryTextClass,
} from "@/lib/table-display-styles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  emeraldGlassPrimaryButtonClass,
  skyGlassTableFrameClass,
  violetGlassImportButtonClass,
} from "@/lib/calendar-header-action-styles";
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
import { Patient } from "@/types/types";
import {
  AlertCircle,
  EllipsisVertical,
  Pencil,
  Trash2,
  Download,
  CircleCheck,
  CircleOff,
  Eye,
  ListFilter,
  UserPlus,
  Activity,
  Stethoscope,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { PatientCreateInput } from "@/hooks/usePatients";
import { format } from "date-fns";
import { FilterSelect } from "@/components/shared/filters/FilterSelect";
import { APP_NAVBAR_STICKY_OFFSET_CLASS } from "@/lib/portal-z-index";
import {
  PatientListFiltersProvider,
  usePatientListFilters,
  type PatientCareTierFilter,
  type PatientPrimaryDoctorFilter,
  type PatientStatusFilter,
} from "@/components/control-panel/PatientListFiltersContext";
import { PatientManagementStatsRow } from "@/components/control-panel/PatientManagementStatsRow";
import { PatientMetricsProvider } from "@/context/PatientMetricsContext";
import { usePatientListMetrics } from "@/hooks/usePatientListMetrics";
import { PatientFormDialog } from "@/components/control-panel/patient-dialog/PatientFormDialog";
import {
  buildClinicalProfileFromDialogExtra,
  buildCreateClinicalProfile,
  EMPTY_PATIENT_DIALOG_EXTRA,
  EMPTY_PATIENT_DIALOG_FORM,
  patientToDialogExtraState,
  patientToDialogFormState,
  type PatientFormDialogExtra,
} from "@/lib/patient-form-clinical";
import { useUsers } from "@/hooks/useUsers";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchDoctorsDirectory } from "@/lib/prefetch-doctors-directory";
import {
  patientManagementFilterToolbarClass,
  patientManagementStatsStripClass,
} from "@/lib/patient-management-toolbar-classes";
import { PATIENT_CARE_LEVEL_STAGES, getPatientCareLevelLabel } from "@/lib/patient-care-level";
import { patientDetailHref, type EntityRole } from "@/lib/entity-routes";

/** Control panel full admin table vs doctor-portal scoped roster (shared filters + DataTable). */
export type PatientManagementVariant = "control-panel" | "doctor-portal";

export type PatientManagementInnerProps = {
  variant?: PatientManagementVariant;
  viewerRole?: EntityRole;
  lockedPrimaryDoctorId?: string;
  /** Doctor portal section badge — filtered row count after toolbar filters. */
  onFilteredCountChange?: (count: number) => void;
};

const STATUS_FILTER_LABEL: Record<PatientStatusFilter, string> = {
  all: "All Statuses",
  active: "Active",
  inactive: "Inactive",
};

/** Shown inside the care-tier filter trigger — mirrors tier scale from `patient-care-level`. */
function careTierTriggerLabel(tier: PatientCareTierFilter): string {
  if (tier === "all") return "All Care Tiers";
  if (tier === "unset") return "No Tier Set";
  const n = Number(tier);
  const s = PATIENT_CARE_LEVEL_STAGES.find((x) => x.value === n);
  return s ? `${n} — ${s.shortLabel}` : `Tier ${n}`;
}

function exportPatientsCSV(patients: Patient[]) {
  const headers = [
    "ID",
    "First Name",
    "Last Name",
    "Email",
    "Care Tier",
    "Primary Doctor",
    "Primary Doctor Email",
    "Birth Date",
    "Pronoun",
    "Active",
    "Active Since",
    "Created At",
  ];
  const rows = patients.map((p) => [
    p.id,
    `"${p.firstname}"`,
    `"${p.lastname}"`,
    p.email ?? "",
    getPatientCareLevelLabel(p.care_level).replace(/—/g, "-"),
    p.primary_doctor_display ?? "",
    p.primary_doctor_email ?? "",
    p.birth_date ? format(new Date(p.birth_date), "yyyy-MM-dd") : "",
    p.pronoun ?? "",
    p.active ? "Yes" : "No",
    p.active_since ? format(new Date(p.active_since), "yyyy-MM-dd") : "",
    format(new Date(p.created_at), "yyyy-MM-dd HH:mm"),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `patients-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function PatientActions({
  patient,
  onDelete,
  onEdit,
  variant,
  viewerRole = "admin",
  lockedPrimaryDoctorId,
}: {
  patient: Patient;
  onDelete: (p: Patient) => void;
  /** Control-panel list — open glass edit dialog instead of navigating away. */
  onEdit?: (p: Patient) => void;
  variant: PatientManagementVariant;
  viewerRole?: EntityRole;
  lockedPrimaryDoctorId?: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const detailHref = patientDetailHref(viewerRole, patient.id);
  const canMutate =
    variant === "control-panel" ||
    (!!lockedPrimaryDoctorId && patient.primary_doctor_id === lockedPrimaryDoctorId);
  /** List edit always uses glass dialog when parent passes `onEdit` (CP + doctor-portal roster). */
  const useEditDialog = canMutate && onEdit != null;

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
              href={detailHref}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              View
            </PrefetchingLink>
          </DropdownMenuItem>
          {useEditDialog ? (
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onSelect={() => onEdit(patient)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
          ) : null}
          {variant === "control-panel" ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive flex items-center gap-2"
                onSelect={() => setConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {variant === "control-panel" ? (
        <ConfirmActionDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Permanently remove this patient?"
          subtitle={
            <>
              This will delete{" "}
              <span className="font-medium text-gray-700">
                {`${patient.firstname} ${patient.lastname}`.trim()}
                {patient.email ? ` (${patient.email})` : ""}
              </span>{" "}
              and all related data tied to this record. You cannot undo this action.
            </>
          }
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={() => {
            onDelete(patient);
            setConfirmOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

export function PatientManagementInner({
  variant = "control-panel",
  viewerRole = "admin",
  lockedPrimaryDoctorId,
  onFilteredCountChange,
}: PatientManagementInnerProps = {}) {
  const isDoctorPortal = variant === "doctor-portal";
  const {
    patients,
    isLoading,
    isFetching,
    isError: patientsError,
    createPatient,
    isCreating,
    updatePatient,
    isUpdating,
    deletePatient,
  } = usePatients();
  const queryClient = useQueryClient();
  const [listUiMounted, setListUiMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setListUiMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  /** SSR-seeded cache: chrome + stats stay real; pulse table rows only when no list data yet. */
  const hasPatientsCache = patients.length > 0;
  const listBodyLoading = !listUiMounted || (isLoading && !hasPatientsCache);
  const { data: doctorsData } = useUsers({ role: "doctor", limit: 200 });
  const doctorById = useMemo(() => {
    const list = doctorsData?.users ?? [];
    return new Map(list.map((d) => [d.id, d]));
  }, [doctorsData?.users]);
  const doctors = doctorsData?.users ?? [];
  const {
    status,
    setStatus,
    careTier,
    setCareTier,
    primaryDoctorId,
    setPrimaryDoctorId,
    lockPrimaryDoctor,
    filterByStatus,
  } = usePatientListFilters();
  const filteredPatients = filterByStatus(patients);

  useEffect(() => {
    onFilteredCountChange?.(filteredPatients.length);
  }, [filteredPatients.length, onFilteredCountChange]);
  const primaryDoctorTriggerLabel: string =
    primaryDoctorId === "all"
      ? "All Doctors"
      : doctors.find((d) => d.id === primaryDoctorId)?.display_name?.trim() ||
      doctors.find((d) => d.id === primaryDoctorId)?.email ||
      "Doctor";
  /** Toolbar search — controlled so header stays stable while table rows skeleton (no duplicate search under table). */
  const [listSearch, setListSearch] = useState("");
  const hasPatientToolbarFilters = useMemo(
    () =>
      listSearch.trim().length > 0 ||
      status !== "all" ||
      careTier !== "all" ||
      (!lockPrimaryDoctor && primaryDoctorId !== "all"),
    [listSearch, status, careTier, primaryDoctorId, lockPrimaryDoctor]
  );
  const resetPatientToolbar = () => {
    setListSearch("");
    setStatus("all");
    setCareTier("all");
    if (!lockPrimaryDoctor) setPrimaryDoctorId("all");
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [form, setForm] = useState<PatientCreateInput>(EMPTY_PATIENT_DIALOG_FORM);
  /** Dialog extras — clinical_profile + primary doctor (create + edit). */
  const [createExtra, setCreateExtra] = useState<PatientFormDialogExtra>(EMPTY_PATIENT_DIALOG_EXTRA);

  const resetPatientDialog = () => {
    setDialogMode("create");
    setEditingPatient(null);
    setForm(EMPTY_PATIENT_DIALOG_FORM);
    setCreateExtra(EMPTY_PATIENT_DIALOG_EXTRA);
  };

  const openCreateDialog = () => {
    resetPatientDialog();
    prefetchDoctorsDirectory(queryClient);
    setDialogOpen(true);
  };

  const openEditDialog = useCallback(
    (patient: Patient) => {
      prefetchDoctorsDirectory(queryClient);
      setDialogMode("edit");
      setEditingPatient(patient);
      setForm(patientToDialogFormState(patient));
      setCreateExtra(patientToDialogExtraState(patient));
      setDialogOpen(true);
    },
    [queryClient]
  );

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) resetPatientDialog();
  };

  const columns: ColumnDef<Patient>[] = useMemo(() => {
    const primaryDoctorCol: ColumnDef<Patient> = {
      id: "primary_doctor_display",
      accessorFn: (row) =>
        `${row.primary_doctor_display ?? ""} ${row.primary_doctor_email ?? ""}`.trim(),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Primary Doctor" />,
      meta: { shellClassName: "w-[23%] min-w-[11rem] min-w-0" },
      cell: ({ row }) => {
        const p = row.original;
        const d = p.primary_doctor_display?.trim();
        const em = p.primary_doctor_email?.trim();
        if (!d && !em) {
          return (
            <div className="flex min-h-[2.75rem] items-center">
              <span className={clinicalCellMutedTextClass}>—</span>
            </div>
          );
        }
        return (
          <div className="flex min-h-[2.75rem] min-w-0 flex-col justify-center gap-0.5">
            {(() => {
              const doc = p.primary_doctor_id ? doctorById.get(p.primary_doctor_id) : undefined;
              if (p.primary_doctor_id && doc) {
                return (
                  <DoctorIdentityRow
                    doctor={{
                      id: doc.id,
                      email: doc.email,
                      display_name: doc.display_name,
                      image: doc.image,
                      specialty: doc.specialty,
                    }}
                    linkKind="admin-cp"
                    size="sm"
                    showEmail
                  />
                );
              }
              return (
                <>
                  {d ? <span className={cn("truncate", clinicalCellPrimaryTextClass)}>{d}</span> : null}
                  {em ? (
                    <span className={cn("truncate", clinicalCellMutedTextClass)} title={em}>
                      {em}
                    </span>
                  ) : (
                    <span className={clinicalCellMutedTextClass}>—</span>
                  )}
                </>
              );
            })()}
          </div>
        );
      },
    };

    const cols: ColumnDef<Patient>[] = [
    {
      id: "name",
      // Avatar + name + email in one column so layout stays grouped on wide screens (no split image / text columns).
      accessorFn: (row) =>
        `${row.firstname} ${row.lastname} ${row.email ?? ""}`.trim(),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Patient Name" />,
      meta: {
        shellClassName: isDoctorPortal
          ? "w-[32%] min-w-[14rem] max-w-[28rem]"
          : "w-[28.5%] min-w-[14rem] max-w-[28rem]",
      },
      cell: ({ row }) => {
        const p = row.original;
        const name = `${p.firstname} ${p.lastname}`.trim() || "—";
        return (
          <PatientIdentityCell
            name={name}
            email={p.email}
            href={patientDetailHref(viewerRole, p.id)}
            patient={p}
          />
        );
      },
    },
    {
      accessorKey: "care_level",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Care Tier" />,
      meta: {
        shellClassName: "w-[17%] min-w-[10rem] whitespace-normal",
      },
      cell: ({ row }) => (
        <div className="flex min-h-[2.75rem] w-full min-w-0 items-center">
          <span
            className={cn("line-clamp-2 min-w-0 break-words", clinicalCellPrimaryTextClass)}
            title={getPatientCareLevelLabel(row.original.care_level)}
          >
            {getPatientCareLevelLabel(row.original.care_level)}
          </span>
        </div>
      ),
    },
    ...(isDoctorPortal ? [] : [primaryDoctorCol]),
    {
      accessorKey: "active",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      meta: { shellClassName: "w-[10%] min-w-[7.25rem] whitespace-nowrap" },
      cell: ({ row }) => (
        <div className="flex min-h-[2.75rem] items-center">
          <Badge
            variant="outline"
            className={
              row.original.active
                ? "max-w-full truncate text-xs border-emerald-200 bg-emerald-50 text-emerald-700"
                : "max-w-full truncate text-xs border-slate-200 bg-slate-50 text-slate-600"
            }
          >
            {row.original.active ? (
              <CircleCheck className="mr-1 h-3.5 w-3.5" />
            ) : (
              <CircleOff className="mr-1 h-3.5 w-3.5" />
            )}
            {row.original.active ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      meta: { shellClassName: "w-[13.5%] min-w-[9rem] whitespace-nowrap" },
      cell: ({ row }) =>
        row.original.created_at ? (
          <div className="flex min-h-[2.75rem] items-center">
            <span className="block whitespace-nowrap text-xs">
              {format(new Date(row.original.created_at), "MMM d, yyyy")}
            </span>
          </div>
        ) : (
          <div className="flex min-h-[2.75rem] items-center text-muted-foreground">—</div>
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
          <PatientActions
            patient={row.original}
            variant={variant}
            viewerRole={viewerRole}
            lockedPrimaryDoctorId={lockedPrimaryDoctorId}
            onDelete={(pat) =>
              deletePatient({
                id: pat.id,
                name: `${pat.firstname} ${pat.lastname}`.trim(),
                email: pat.email,
              })
            }
            onEdit={openEditDialog}
          />
        </div>
      ),
    },
  ];
    return cols;
  }, [
    isDoctorPortal,
    viewerRole,
    variant,
    lockedPrimaryDoctorId,
    doctorById,
    deletePatient,
    openEditDialog,
  ]);

  const metrics = usePatientListMetrics(patients);

  const handleDialogSubmit = () => {
    const primary_doctor_id =
      createExtra.primaryDoctorId && createExtra.primaryDoctorId !== "none"
        ? createExtra.primaryDoctorId
        : null;

    if (dialogMode === "edit" && editingPatient) {
      const clinical_profile = buildClinicalProfileFromDialogExtra(
        editingPatient.clinical_profile,
        createExtra
      );
      updatePatient(
        {
          id: editingPatient.id,
          firstname: form.firstname.trim(),
          lastname: form.lastname.trim(),
          birth_date: form.birth_date || undefined,
          care_level: form.care_level,
          pronoun: form.pronoun || undefined,
          active: form.active,
          clinical_profile,
          primary_doctor_id,
        },
        { onSuccess: () => handleDialogOpenChange(false) }
      );
      return;
    }

    const clinical_profile = buildCreateClinicalProfile(createExtra);
    createPatient(
      {
        ...form,
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        primary_doctor_id: primary_doctor_id ?? undefined,
        ...(clinical_profile ? { clinical_profile } : {}),
      },
      { onSuccess: () => handleDialogOpenChange(false) }
    );
  };

  if (patientsError) {
    return (
      <div className="space-y-2 text-gray-700">
        {!isDoctorPortal ? (
          <PageHeader title="Patients" description="Manage patients." />
        ) : null}
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load patients. Please refresh.
        </div>
      </div>
    );
  }

  const listChrome = (
      <div
        className={cn(
          "space-y-2 text-gray-700",
          isDoctorPortal && "space-y-3",
          !isDoctorPortal && "overflow-visible"
        )}
      >
        {!isDoctorPortal ? (
          <PageHeader
            title="Patients"
            description="Manage patients. All table schema properties are shown."
            actions={
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  disabled={listBodyLoading || patients.length === 0}
                  className={cn(violetGlassImportButtonClass, "cursor-pointer disabled:opacity-50")}
                  onClick={() => exportPatientsCSV(patients)}
                >
                  <Download className="shrink-0" aria-hidden />
                  Export CSV
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className={cn(emeraldGlassPrimaryButtonClass, "cursor-pointer")}
                  onClick={openCreateDialog}
                >
                  <UserPlus className="shrink-0" aria-hidden />
                  Add Patient
                </Button>
              </>
            }
          />
        ) : null}

        {!isDoctorPortal ? (
          <div className={patientManagementStatsStripClass}>
            <PatientManagementStatsRow />
          </div>
        ) : null}

        {/* Sticky toolbar: transparent shell so stat card shadows are not clipped (see patient-management-toolbar-classes). */}
        <div className={cn(patientManagementFilterToolbarClass, APP_NAVBAR_STICKY_OFFSET_CLASS)}>
          <EntityListSearchInput
            value={listSearch}
            onChange={setListSearch}
            placeholder="Search… (name or email)"
            ariaLabel="Search patients by name or email"
          />
          <FilterSelect
            value={status}
            onValueChange={(v) => setStatus(v as PatientStatusFilter)}
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
          <FilterSelect
            value={careTier}
            onValueChange={(v) => setCareTier(v as PatientCareTierFilter)}
            displayLabel={careTierTriggerLabel(careTier)}
            icon={Activity}
            size="toolbar"
            triggerClassName="min-w-[200px] max-w-[min(42vw,280px)]"
            ariaLabel="Filter by care tier"
            options={[
              { value: "all", label: "All Care Tiers" },
              { value: "unset", label: "No Tier Set" },
              ...PATIENT_CARE_LEVEL_STAGES.map((s) => ({
                value: String(s.value),
                label: `${s.value} — ${s.shortLabel}`,
              })),
            ]}
          />
          {!lockPrimaryDoctor ? (
            <FilterSelect
              value={primaryDoctorId}
              onValueChange={(v) => setPrimaryDoctorId(v as PatientPrimaryDoctorFilter)}
              displayLabel={primaryDoctorTriggerLabel}
              icon={Stethoscope}
              size="toolbar"
              triggerClassName="min-w-[200px] max-w-[min(42vw,280px)]"
              ariaLabel="Filter by primary doctor"
              options={[
                { value: "all", label: "All Doctors" },
                ...doctors.map((d) => ({
                  value: d.id,
                  label: d.display_name?.trim() || d.email,
                })),
              ]}
            />
          ) : null}
          {hasPatientToolbarFilters ? (
            <GlassResetFilterButton
              onClick={resetPatientToolbar}
              className="ml-auto h-10 shrink-0 px-4 [&_svg]:size-4"
            />
          ) : null}
        </div>

        <DataTable<Patient, unknown>
          columns={columns}
          data={filteredPatients}
          isLoading={listBodyLoading}
          globalFilterFn={(row, q) => {
            const s = q.trim().toLowerCase();
            if (!s) return true;
            const p = row;
            const tierText = getPatientCareLevelLabel(p.care_level).toLowerCase();
            const blob = `${p.firstname} ${p.lastname} ${p.email ?? ""} ${p.primary_doctor_display ?? ""} ${p.primary_doctor_email ?? ""} ${String(p.care_level ?? "")} ${tierText}`;
            return blob.includes(s);
          }}
          externalGlobalFilter={{ value: listSearch, onChange: setListSearch }}
          searchPlaceholder="Search by name or email…"
          emptyMessage={
            isDoctorPortal
              ? "No patients assigned to you yet."
              : "No patients yet. Add one to get started."
          }
          tableClassName="min-w-[980px] w-full"
          tableFrameClassName={skyGlassTableFrameClass}
        />

        <PatientFormDialog
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
          mode={dialogMode}
          readOnlyEmail={editingPatient?.email}
          form={form}
          onFormChange={(patch) => setForm((p) => ({ ...p, ...patch }))}
          createExtra={createExtra}
          onCreateExtraChange={(patch) => setCreateExtra((x) => ({ ...x, ...patch }))}
          onSubmit={handleDialogSubmit}
          isSubmitting={dialogMode === "edit" ? isUpdating : isCreating}
        />
      </div>
  );

  if (isDoctorPortal) {
    return listChrome;
  }

  return (
    <PatientMetricsProvider
      value={{ patients, metrics, isLoading, isFetching, listBodyLoading }}
    >
      {listChrome}
    </PatientMetricsProvider>
  );
}

export default function PatientManagement(props?: PatientManagementInnerProps) {
  return (
    <PatientListFiltersProvider>
      <PatientManagementInner {...props} />
    </PatientListFiltersProvider>
  );
}
