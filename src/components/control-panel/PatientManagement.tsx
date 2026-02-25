"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { usePatients } from "@/hooks/usePatients";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@/types/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { PatientCreateInput } from "@/hooks/usePatients";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "firstname",
    header: "First name",
    cell: ({ row }) => row.original.firstname,
  },
  {
    accessorKey: "lastname",
    header: "Last name",
    cell: ({ row }) => row.original.lastname,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email ?? "—",
  },
  {
    accessorKey: "birth_date",
    header: "Birth date",
    cell: ({ row }) => (row.original.birth_date ? String(row.original.birth_date).slice(0, 10) : "—"),
  },
  {
    accessorKey: "care_level",
    header: "Care level",
    cell: ({ row }) => row.original.care_level ?? "—",
  },
  {
    accessorKey: "pronoun",
    header: "Pronoun",
    cell: ({ row }) => row.original.pronoun ?? "—",
  },
  {
    accessorKey: "active",
    header: "Active",
    cell: ({ row }) => (
      <Badge variant={row.original.active ? "default" : "secondary"}>
        {row.original.active ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/control-panel/patients/${id}`} aria-label="View patient">
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];

export default function PatientManagement() {
  const router = useRouter();
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

  const handleCreate = () => {
    createPatient(
      {
        ...form,
        firstname: form.firstname.trim(),
        lastname: form.lastname.trim(),
      },
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
        description="View and manage patients. All table schema properties are shown."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add patient
          </Button>
        }
      />
      <DataTable<Patient, unknown>
        columns={columns}
        data={patients}
        isLoading={isLoading}
        searchColumnId="lastname"
        searchPlaceholder="Search by last name..."
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
                <Label>First name</Label>
                <Input
                  value={form.firstname}
                  onChange={(e) => setForm((p) => ({ ...p, firstname: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
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
                <Label>Birth date</Label>
                <Input
                  type="date"
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
            <div className="space-y-2">
              <Label>Pronoun</Label>
              <Select
                value={form.pronoun ?? ""}
                onValueChange={(v) => setForm((p) => ({ ...p, pronoun: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
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
              <Label>Active</Label>
              <Select
                value={form.active ? "yes" : "no"}
                onValueChange={(v) => setForm((p) => ({ ...p, active: v === "yes" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !form.firstname.trim() || !form.lastname.trim()}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
