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
  Plus,
  EllipsisVertical,
  Pencil,
  Trash2,
  Download,
  CircleCheck,
  CircleOff,
  Eye,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
} from "@/components/control-panel/PatientListFiltersContext";

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
  const { patients, isLoading, createPatient, isCreating, deletePatient } = usePatients();
  const { status, setStatus, filterByStatus } = usePatientListFilters();
  const filteredPatients = filterByStatus(patients);
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
      header: "Actions",
      enableSorting: false,
      meta: { headClassName: "w-12 text-right", cellClassName: "w-12 text-right" },
      cell: ({ row }) => (
        <PatientActions patient={row.original} onDelete={deletePatient} />
      ),
    },
  ];

  const handleCreate = () => {
    createPatient(
      { ...form, firstname: form.firstname.trim(), lastname: form.lastname.trim() },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({ firstname: "", lastname: "", email: "", birth_date: "", pronoun: "", active: true });
        },
      }
    );
  };

  return (
    <div className="space-y-2 text-gray-700">
      <PageHeader
        title="Patient Management"
        description="Manage patients. All table schema properties are shown."
        actions={
          <div className="flex flex-wrap gap-2">
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as "all" | "active" | "inactive")}
            >
              <SelectTrigger className="w-[140px]" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => exportPatientsCSV(patients)} disabled={patients.length === 0} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add patient
            </Button>
          </div>
        }
      />

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
        searchPlaceholder="Search by name or email…"
        emptyMessage="No patients yet. Add one to get started."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add patient</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First name *</Label>
                <Input
                  value={form.firstname}
                  onChange={(e) => setForm((p) => ({ ...p, firstname: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label>Last name *</Label>
                <Input
                  value={form.lastname}
                  onChange={(e) => setForm((p) => ({ ...p, lastname: e.target.value }))}
                  placeholder="Last name"
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
                />
              </div>
              <div className="space-y-2">
                <Label>Care level</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.care_level ?? ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      care_level: e.target.value === "" ? undefined : Number(e.target.value),
                    }))
                  }
                  placeholder="0"
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
                  <SelectTrigger>
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
                  <SelectTrigger>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !form.firstname.trim() || !form.lastname.trim()}
            >
              {isCreating ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PatientManagement() {
  return (
    <PatientListFiltersProvider>
      <PatientManagementInner />
    </PatientListFiltersProvider>
  );
}
