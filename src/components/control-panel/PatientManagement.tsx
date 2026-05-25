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
import { FiSearch } from "react-icons/fi";
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
  X,
  Activity,
  Stethoscope,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PatientCreateInput } from "@/hooks/usePatients";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PatientListFiltersProvider,
  usePatientListFilters,
  type PatientCareTierFilter,
  type PatientPrimaryDoctorFilter,
  type PatientStatusFilter,
} from "@/components/control-panel/PatientListFiltersContext";
import { PatientManagementStatsRow } from "@/components/control-panel/PatientManagementStatsRow";
import { PatientCareLevelSelect } from "@/components/control-panel/PatientCareLevelSelect";
import { PatientMetricsProvider } from "@/context/PatientMetricsContext";
import { usePatientListMetrics } from "@/hooks/usePatientListMetrics";
import { Textarea } from "@/components/ui/textarea";
import { useUsers } from "@/hooks/useUsers";
import { PATIENT_REFERRAL_SOURCES } from "@/lib/patient-referral-sources";
import { PATIENT_CARE_LEVEL_STAGES, getPatientCareLevelLabel } from "@/lib/patient-care-level";
import { patientDetailHref, type EntityRole } from "@/lib/entity-routes";
import type { PatientClinicalProfile } from "@/types/types";

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

/** Build `clinical_profile` JSON for POST /api/patients from add-dialog fields (allergies CSV, notes, referral). */
function buildCreateClinicalProfile(extra: {
  allergiesCsv: string;
  clinicalNotes: string;
  referralSource: string;
  referralDetail: string;
}): PatientClinicalProfile | undefined {
  const allergies = extra.allergiesCsv.split(",").map((s) => s.trim()).filter(Boolean);
  const notes = extra.clinicalNotes.trim();
  const rd =
    extra.referralSource === "external_partner" || extra.referralSource === "other"
      ? extra.referralDetail.trim()
      : "";
  const o: Record<string, unknown> = { referral_source: extra.referralSource };
  if (allergies.length) o.allergies = allergies;
  if (notes) o.notes = notes;
  if (rd) o.referral_detail = rd;
  return Object.keys(o).length ? (o as PatientClinicalProfile) : undefined;
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
  variant,
  viewerRole = "admin",
  lockedPrimaryDoctorId,
}: {
  patient: Patient;
  onDelete: (p: Patient) => void;
  variant: PatientManagementVariant;
  viewerRole?: EntityRole;
  lockedPrimaryDoctorId?: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const detailHref = patientDetailHref(viewerRole, patient.id);
  const canMutate =
    variant === "control-panel" ||
    (!!lockedPrimaryDoctorId && patient.primary_doctor_id === lockedPrimaryDoctorId);
  const editHref = canMutate ? `${detailHref}?mode=edit` : detailHref;

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
          {canMutate ? (
            <DropdownMenuItem asChild>
              <PrefetchingLink
                href={editHref}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </PrefetchingLink>
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
  const { patients, isLoading, isFetching, isError: patientsError, createPatient, isCreating, deletePatient } = usePatients();
  const [listUiMounted, setListUiMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setListUiMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  /** Align SSR + first client paint with React Query (query can finish on client before mount). */
  const listBodyLoading = !listUiMounted || isLoading;
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
  const [form, setForm] = useState<PatientCreateInput>({
    firstname: "",
    lastname: "",
    email: "",
    birth_date: "",
    care_level: undefined,
    pronoun: "",
    active: true,
  });
  /** Add-dialog only — merged into `clinical_profile` + `primary_doctor_id` on create (not part of table row model). */
  const [createExtra, setCreateExtra] = useState({
    allergiesCsv: "",
    clinicalNotes: "",
    primaryDoctorId: "",
    referralSource: "control_panel",
    referralDetail: "",
  });

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
  ]);

  const metrics = usePatientListMetrics(patients);

  const handleCreate = () => {
    const clinical_profile = buildCreateClinicalProfile(createExtra);
    const primary_doctor_id =
      createExtra.primaryDoctorId && createExtra.primaryDoctorId !== "none"
        ? createExtra.primaryDoctorId
        : undefined;
    createPatient(
      {
        ...form,
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
        primary_doctor_id,
        ...(clinical_profile ? { clinical_profile } : {}),
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({
            firstname: "",
            lastname: "",
            email: "",
            birth_date: "",
            care_level: undefined,
            pronoun: "",
            active: true,
          });
          setCreateExtra({
            allergiesCsv: "",
            clinicalNotes: "",
            primaryDoctorId: "",
            referralSource: "control_panel",
            referralDetail: "",
          });
        },
      }
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
      <div className={cn("space-y-2 text-gray-700", isDoctorPortal && "space-y-3")}>
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
                  onClick={() => setDialogOpen(true)}
                >
                  <UserPlus className="shrink-0" aria-hidden />
                  Add Patient
                </Button>
              </>
            }
          />
        ) : null}

        {!isDoctorPortal ? <PatientManagementStatsRow /> : null}

        {/* Sticky toolbar: filters + search only (export/add moved to PageHeader). */}
        <div className="sticky top-0 z-10 flex min-h-[52px] flex-wrap items-center gap-2 bg-transparent backdrop-blur-sm">
          <div className="relative min-w-0 w-full flex-1 sm:max-w-md sm:flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch className="h-4 w-4" aria-hidden />
            </span>
            <Input
              type="search"
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              placeholder="Search… (name or email)"
              className="h-10 w-full min-w-0 rounded-2xl border-gray-200 bg-white pl-8 pr-2 text-sm text-gray-700 shadow-sm placeholder:text-gray-400 focus:border-slate-400 focus:ring-slate-200"
              aria-label="Search patients by name or email"
            />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as PatientStatusFilter)}>
            <SelectTrigger
              className="h-10 w-auto min-w-[160px] max-w-[200px] shrink-0 rounded-2xl border-gray-200 bg-white text-gray-700 shadow-sm gap-2"
              aria-label="Filter by status"
            >
              <ListFilter className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
              <SelectValue>{STATUS_FILTER_LABEL[status]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={careTier}
            onValueChange={(v) => setCareTier(v as PatientCareTierFilter)}
          >
            <SelectTrigger
              className="h-10 w-auto min-w-[200px] max-w-[min(42vw,280px)] shrink-0 rounded-2xl border-gray-200 bg-white text-gray-700 shadow-sm gap-2"
              aria-label="Filter by care tier"
            >
              <Activity className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
              <SelectValue>{careTierTriggerLabel(careTier)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Care Tiers</SelectItem>
              <SelectItem value="unset">No Tier Set</SelectItem>
              {PATIENT_CARE_LEVEL_STAGES.map((s) => (
                <SelectItem key={s.value} value={String(s.value)} title={s.detail}>
                  {s.value} — {s.shortLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!lockPrimaryDoctor ? (
            <Select
              value={primaryDoctorId}
              onValueChange={(v) => setPrimaryDoctorId(v as PatientPrimaryDoctorFilter)}
            >
              <SelectTrigger
                className="h-10 w-auto min-w-[200px] max-w-[min(42vw,280px)] shrink-0 rounded-2xl border-gray-200 bg-white text-gray-700 shadow-sm gap-2"
                aria-label="Filter by primary doctor"
              >
                <Stethoscope className="h-3.5 w-3.5 shrink-0 text-gray-400" aria-hidden />
                <SelectValue>{primaryDoctorTriggerLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.display_name?.trim() || d.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        {!isDoctorPortal ? (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            showCloseButton={false}
            className="flex h-auto max-h-[90vh] w-[92vw] max-w-[1200px] flex-col gap-0 overflow-hidden rounded-[28px] border border-emerald-400/30 bg-white p-0 shadow-[0_30px_80px_rgba(16,185,129,0.28)]"
            aria-describedby={undefined}
          >
            <div className="shrink-0 bg-white pt-6">
              <div className="px-6">
                <div className="flex items-start gap-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/70 bg-emerald-50 text-emerald-700">
                    <UserPlus className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <DialogTitle className="text-xl font-semibold text-gray-700">
                      Add Patient
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Required: first and last name. Optional fields help scheduling and records stay accurate.
                    </DialogDescription>
                  </div>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-auto h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-emerald-100 hover:text-emerald-700"
                    >
                      <X className="h-4 w-4" aria-hidden />
                      <span className="sr-only">Close</span>
                    </Button>
                  </DialogClose>
                </div>
              </div>
              <div className="mx-6 mt-4 border-b border-emerald-200/60" />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input
                      value={form.firstname}
                      onChange={(e) => setForm((p) => ({ ...p, firstname: e.target.value }))}
                      placeholder="First Name"
                      className="w-full min-w-0 rounded-2xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input
                      value={form.lastname}
                      onChange={(e) => setForm((p) => ({ ...p, lastname: e.target.value }))}
                      placeholder="Last Name"
                      className="w-full min-w-0 rounded-2xl border-gray-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="name@example.com"
                    className="w-full min-w-0 rounded-2xl border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pm-primary-doctor">Select Primary Doctor (from staff list)</Label>
                  <Select
                    value={createExtra.primaryDoctorId || "none"}
                    onValueChange={(v) =>
                      setCreateExtra((x) => ({ ...x, primaryDoctorId: v === "none" ? "" : v }))
                    }
                  >
                    <SelectTrigger id="pm-primary-doctor" className="w-full min-w-0 rounded-2xl border-gray-200">
                      <SelectValue placeholder="Not Assigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not Assigned</SelectItem>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.display_name?.trim() || d.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pm-birth-date">Select Birth Date</Label>
                    <Input
                      id="pm-birth-date"
                      type="date"
                      title="Birth Date"
                      value={form.birth_date ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, birth_date: e.target.value }))}
                      className="w-full min-w-0 rounded-2xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pm-care-level">Select Care Level (1–10)</Label>
                    <PatientCareLevelSelect
                      id="pm-care-level"
                      value={form.care_level}
                      onValueChange={(next) => setForm((p) => ({ ...p, care_level: next }))}
                      aria-label="Care level tier from 1 to 10"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Select Pronoun</Label>
                    <Select
                      value={form.pronoun ?? ""}
                      onValueChange={(v) => setForm((p) => ({ ...p, pronoun: v }))}
                    >
                      <SelectTrigger className="w-full min-w-0 rounded-2xl border-gray-200">
                        <SelectValue placeholder="Pronoun" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="he/him">He/Him</SelectItem>
                        <SelectItem value="she/her">She/Her</SelectItem>
                        <SelectItem value="they/them">They/Them</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Select Status</Label>
                    <Select
                      value={form.active ? "true" : "false"}
                      onValueChange={(v) => setForm((p) => ({ ...p, active: v === "true" }))}
                    >
                      <SelectTrigger className="w-full min-w-0 rounded-2xl border-gray-200">
                        <SelectValue placeholder="Active" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Select Referral / Intake</Label>
                  <Select
                    value={createExtra.referralSource}
                    onValueChange={(v) => setCreateExtra((x) => ({ ...x, referralSource: v }))}
                  >
                    <SelectTrigger className="w-full min-w-0 rounded-2xl border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PATIENT_REFERRAL_SOURCES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(createExtra.referralSource === "external_partner" ||
                  createExtra.referralSource === "other") && (
                    <div className="space-y-2">
                      <Label htmlFor="pm-referral-detail">Type External / Other Detail</Label>
                      <Input
                        id="pm-referral-detail"
                        title="Referral Detail"
                        value={createExtra.referralDetail}
                        onChange={(e) =>
                          setCreateExtra((x) => ({ ...x, referralDetail: e.target.value }))
                        }
                        placeholder="Clinic, referrer, or how they reached you"
                        className="w-full min-w-0 rounded-2xl border-gray-200"
                      />
                    </div>
                  )}
                <div className="space-y-2">
                  <Label htmlFor="pm-allergies">Type Allergies if Any (comma-separated)</Label>
                  <Input
                    id="pm-allergies"
                    title="Allergies"
                    value={createExtra.allergiesCsv}
                    onChange={(e) =>
                      setCreateExtra((x) => ({ ...x, allergiesCsv: e.target.value }))
                    }
                    placeholder="e.g. penicillin, latex"
                    className="w-full min-w-0 rounded-2xl border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pm-clinical-notes">Type Clinical Notes if Any</Label>
                  <Textarea
                    id="pm-clinical-notes"
                    title="Clinical Notes"
                    rows={3}
                    value={createExtra.clinicalNotes}
                    onChange={(e) =>
                      setCreateExtra((x) => ({ ...x, clinicalNotes: e.target.value }))
                    }
                    placeholder="Short clinical context for the team"
                    className="w-full min-w-0 resize-y rounded-2xl border-gray-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-emerald-200/60 bg-emerald-50/40 px-6 py-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl border-emerald-200/70 bg-white"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className={cn(
                  emeraldGlassPrimaryButtonClass,
                  "cursor-pointer disabled:pointer-events-none disabled:opacity-50"
                )}
                onClick={handleCreate}
                disabled={isCreating || !form.firstname.trim() || !form.lastname.trim()}
              >
                {isCreating ? "Creating…" : "Create Patient"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        ) : null}
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
