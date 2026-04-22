"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { usePatients } from "@/hooks/usePatients";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Patient } from "@/types/types";
import { Plus, MoreHorizontal, Pencil, Trash2, Download } from "lucide-react";
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
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/control-panel/patients/${patient.id}`} className="flex items-center gap-2 cursor-pointer">
              <Pencil className="h-4 w-4" />
              View / Edit
            </Link>
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

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete patient?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{patient.firstname} {patient.lastname}</strong> and all related data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => onDelete(patient.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function PatientManagement() {
  const { patients, isLoading, createPatient, isCreating, deletePatient } = usePatients();
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
    { accessorKey: "firstname", header: "First name", cell: ({ row }) => row.original.firstname },
    { accessorKey: "lastname", header: "Last name", cell: ({ row }) => row.original.lastname },
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email ?? "—" },
    {
      accessorKey: "birth_date",
      header: "Birth date",
      cell: ({ row }) => (row.original.birth_date ? String(row.original.birth_date).slice(0, 10) : "—"),
    },
    { accessorKey: "care_level", header: "Care level", cell: ({ row }) => row.original.care_level ?? "—" },
    { accessorKey: "pronoun", header: "Pronoun", cell: ({ row }) => row.original.pronoun ?? "—" },
    {
      accessorKey: "active",
      header: "Active",
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "default" : "secondary"}>
          {row.original.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) =>
        row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "—",
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
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
    <div className="space-y-4">
      <PageHeader
        title="Patient Management"
        description="Manage patients. All table schema properties are shown."
        actions={
          <div className="flex gap-2">
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
        data={patients}
        isLoading={isLoading}
        searchColumnId="lastname"
        searchPlaceholder="Search by last name…"
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

