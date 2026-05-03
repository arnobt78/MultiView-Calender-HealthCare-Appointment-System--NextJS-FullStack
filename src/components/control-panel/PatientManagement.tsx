"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { usePatients } from "@/hooks/usePatients";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  emeraldGlassPrimaryButtonClass,
  violetGlassImportButtonClass,
} from "@/lib/calendar-header-action-styles";
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
} from "lucide-react";
import { useState } from "react";
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
import { DEMO_ACCOUNTS } from "@/lib/demo-credentials";
import {
  PatientListFiltersProvider,
  usePatientListFilters,
  type PatientStatusFilter,
} from "@/components/control-panel/PatientListFiltersContext";
import { PatientManagementStatsRow } from "@/components/control-panel/PatientManagementStatsRow";
import { PatientCareLevelSelect } from "@/components/control-panel/PatientCareLevelSelect";
import { PatientMetricsProvider } from "@/context/PatientMetricsContext";
import { usePatientListMetrics } from "@/hooks/usePatientListMetrics";

const STATUS_FILTER_LABEL: Record<PatientStatusFilter, string> = {
  all: "All Statuses",
  active: "Active",
  inactive: "Inactive",
};

const DEMO_AVATAR_BY_EMAIL = new Map(
  DEMO_ACCOUNTS.map((account) => [account.email.toLowerCase(), account.avatarUrl])
);

function exportPatientsCSV(patients: Patient[]) {
  const headers = ["ID", "First Name", "Last Name", "Email", "Birth Date", "Care Level", "Pronoun", "Active", "Active Since", "Created At"];
  const rows = patients.map((p) => [
    p.id,
    `"${p.firstname}"`,
    `"${p.lastname}"`,
    p.email ?? "",
    p.birth_date ? format(new Date(p.birth_date), "yyyy-MM-dd") : "",
    p.care_level ?? "",
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
}: {
  patient: Patient;
  onDelete: (id: string) => void;
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
              href={`/control-panel/patients/${patient.id}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              View
            </PrefetchingLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <PrefetchingLink
              href={`/control-panel/patients/${patient.id}?mode=edit`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </PrefetchingLink>
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
        title="Permanently remove this patient?"
        subtitle={
          <>
            This will delete{" "}
            <span className="font-medium text-gray-800">
              {`${patient.firstname} ${patient.lastname}`.trim()}
              {patient.email ? ` (${patient.email})` : ""}
            </span>{" "}
            and all related data tied to this record. You cannot undo this action.
          </>
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          onDelete(patient.id);
          setConfirmOpen(false);
        }}
      />
    </>
  );
}

function PatientManagementInner() {
  const { patients, isLoading, isFetching, createPatient, isCreating, deletePatient } = usePatients();
  const { status, setStatus, filterByStatus } = usePatientListFilters();
  const filteredPatients = filterByStatus(patients);
  /** Toolbar search — controlled so header stays stable while table rows skeleton (no duplicate search under table). */
  const [listSearch, setListSearch] = useState("");
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

  const columns: ColumnDef<Patient>[] = [
    {
      id: "image",
      header: "",
      enableSorting: false,
      meta: { headClassName: "w-12", cellClassName: "w-12" },
      cell: ({ row }) => {
        const p = row.original;
        const fallbackText = `${p.firstname || ""} ${p.lastname || ""}`.trim() || p.email || "?";
        // Prefer curated local avatars for known demo users, fallback to initials only.
        const avatarSrc = p.email ? DEMO_AVATAR_BY_EMAIL.get(p.email.toLowerCase()) ?? null : null;
        return (
          <UserAvatar
            src={avatarSrc}
            fallbackText={fallbackText}
            sizeClassName="h-9 w-9"
          />
        );
      },
    },
    {
      id: "name",
      accessorFn: (row) => `${row.firstname} ${row.lastname}`.trim(),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      meta: { headClassName: "min-w-[180px]", cellClassName: "min-w-[180px]" },
      cell: ({ row }) => (
        <EntityTitleLink
          href={`/control-panel/patients/${row.original.id}`}
          label={`${row.original.firstname} ${row.original.lastname}`.trim() || "—"}
        />
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      meta: { headClassName: "min-w-[190px]", cellClassName: "min-w-[190px]" },
      cell: ({ row }) => row.original.email ?? "—",
    },
    {
      accessorKey: "active",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      meta: { headClassName: "min-w-[120px]", cellClassName: "min-w-[120px]" },
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.active
              ? "text-xs border-emerald-200 bg-emerald-50 text-emerald-700"
              : "text-xs border-slate-200 bg-slate-50 text-slate-600"
          }
        >
          {row.original.active ? (
            <CircleCheck className="mr-1 h-3.5 w-3.5" />
          ) : (
            <CircleOff className="mr-1 h-3.5 w-3.5" />
          )}
          {row.original.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      meta: { headClassName: "min-w-[110px]", cellClassName: "min-w-[110px]" },
      cell: ({ row }) =>
        row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "—",
    },
    {
      id: "actions",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
      enableSorting: false,
      meta: {
        headClassName: "min-w-[108px] w-[108px] max-w-[120px] text-right",
        cellClassName: "min-w-[108px] w-[108px] max-w-[120px] text-right",
      },
      cell: ({ row }) => (
        <PatientActions patient={row.original} onDelete={deletePatient} />
      ),
    },
  ];

  const metrics = usePatientListMetrics(patients);

  const handleCreate = () => {
    createPatient(
      { ...form, firstname: form.firstname.trim(), lastname: form.lastname.trim() },
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
        },
      }
    );
  };

  return (
    <PatientMetricsProvider
      value={{ patients, metrics, isLoading, isFetching }}
    >
      <div className="space-y-2 text-gray-700">
        <PageHeader
          title="Patient Management"
          description="Manage patients. All table schema properties are shown."
        />

        <PatientManagementStatsRow />

        {/* Sticky toolbar: transparent + blur only — no fill or border on this wrapper. */}
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
              className="h-10 w-auto min-w-[160px] shrink-0 rounded-2xl border-gray-200 bg-white text-gray-700 shadow-sm gap-2"
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
          <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="lg"
              disabled={patients.length === 0}
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
          </div>
        </div>

        <DataTable<Patient, unknown>
          columns={columns}
          data={filteredPatients}
          isLoading={isLoading}
          globalFilterFn={(row, q) => {
            const s = q.trim().toLowerCase();
            if (!s) return true;
            const p = row;
            const blob = `${p.firstname} ${p.lastname} ${p.email ?? ""}`.toLowerCase();
            return blob.includes(s);
          }}
          externalGlobalFilter={{ value: listSearch, onChange: setListSearch }}
          searchPlaceholder="Search by name or email…"
          emptyMessage="No patients yet. Add one to get started."
        />

        {/* Shell matches Quick Actions / Global Search: custom close, tinted border + shadow, scroll body, tinted footer. */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent
            showCloseButton={false}
            className="flex h-auto max-h-[90vh] w-[92vw] max-w-[640px] flex-col gap-0 overflow-hidden rounded-[28px] border border-emerald-400/30 bg-white p-0 shadow-[0_30px_80px_rgba(16,185,129,0.28)]"
            aria-describedby={undefined}
          >
            <div className="shrink-0 bg-white pt-6">
              <div className="px-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/70 bg-emerald-50 text-emerald-700">
                    <UserPlus className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <DialogTitle className="text-xl font-semibold text-gray-800">
                      Add patient
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-sm text-muted-foreground">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First name *</Label>
                    <Input
                      value={form.firstname}
                      onChange={(e) => setForm((p) => ({ ...p, firstname: e.target.value }))}
                      placeholder="First name"
                      className="rounded-2xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last name *</Label>
                    <Input
                      value={form.lastname}
                      onChange={(e) => setForm((p) => ({ ...p, lastname: e.target.value }))}
                      placeholder="Last name"
                      className="rounded-2xl border-gray-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="rounded-2xl border-gray-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pm-birth-date">Birth date</Label>
                    <Input
                      id="pm-birth-date"
                      type="date"
                      title="Birth date"
                      value={form.birth_date ?? ""}
                      onChange={(e) => setForm((p) => ({ ...p, birth_date: e.target.value }))}
                      className="rounded-2xl border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pm-care-level">Care level (1–10)</Label>
                    <PatientCareLevelSelect
                      id="pm-care-level"
                      value={form.care_level}
                      onValueChange={(next) => setForm((p) => ({ ...p, care_level: next }))}
                      aria-label="Care level tier from 1 to 10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pronoun</Label>
                    <Select
                      value={form.pronoun ?? ""}
                      onValueChange={(v) => setForm((p) => ({ ...p, pronoun: v }))}
                    >
                      <SelectTrigger className="rounded-2xl border-gray-200">
                        <SelectValue placeholder="Pronoun" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="he/him">he/him</SelectItem>
                        <SelectItem value="she/her">she/her</SelectItem>
                        <SelectItem value="they/them">they/them</SelectItem>
                        <SelectItem value="other">other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={form.active ? "true" : "false"}
                      onValueChange={(v) => setForm((p) => ({ ...p, active: v === "true" }))}
                    >
                      <SelectTrigger className="rounded-2xl border-gray-200">
                        <SelectValue placeholder="Active?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                {isCreating ? "Creating…" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PatientMetricsProvider>
  );
}

export default function PatientManagement() {
  return (
    <PatientListFiltersProvider>
      <PatientManagementInner />
    </PatientListFiltersProvider>
  );
}
