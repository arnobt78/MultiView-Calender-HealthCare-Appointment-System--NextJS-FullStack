"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { useRelatives, type RelativeCreateInput } from "@/hooks/useRelatives";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Relative } from "@/types/types";
import { Plus, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

function RelativeActions({
  relative,
  onEdit,
  onDelete,
}: {
  relative: Relative;
  onEdit: (r: Relative) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(relative)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete relative?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>
                {relative.firstname} {relative.lastname}
              </strong>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { onDelete(relative.id); setConfirmOpen(false); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function RelativesManagement() {
  const { relatives, isLoading, isError, error, createRelative, isCreating, updateRelative, isUpdating, deleteRelative } = useRelatives();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Relative | null>(null);

  const [form, setForm] = useState<RelativeCreateInput>({ firstname: "", lastname: "", pronoun: "", notes: "" });

  function openCreate() {
    setForm({ firstname: "", lastname: "", pronoun: "", notes: "" });
    setCreateOpen(true);
  }

  function openEdit(r: Relative) {
    setForm({ firstname: r.firstname, lastname: r.lastname, pronoun: r.pronoun ?? "", notes: r.notes ?? "" });
    setEditTarget(r);
  }

  function handleCreateSubmit() {
    if (!form.firstname.trim() || !form.lastname.trim()) return;
    createRelative(form, { onSuccess: () => setCreateOpen(false) });
  }

  function handleEditSubmit() {
    if (!editTarget) return;
    updateRelative({ id: editTarget.id, ...form }, { onSuccess: () => setEditTarget(null) });
  }

  const columns: ColumnDef<Relative>[] = [
    {
      accessorKey: "firstname",
      header: "First Name",
    },
    {
      accessorKey: "lastname",
      header: "Last Name",
    },
    {
      accessorKey: "pronoun",
      header: "Pronoun",
      cell: ({ row }) => row.original.pronoun || <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) =>
        row.original.notes ? (
          <span className="max-w-[240px] truncate block">{row.original.notes}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) =>
        row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "—",
    },
    {
      id: "actions",
      header: "",
      size: 48,
      cell: ({ row }) => (
        <RelativeActions
          relative={row.original}
          onEdit={openEdit}
          onDelete={(id) => deleteRelative(id)}
        />
      ),
    },
  ];

  if (isLoading) return <div className="p-4"><Skeleton className="h-[400px] w-full" /></div>;
  if (isError) return <div className="p-4 text-red-500">Error: {error?.message}</div>;

  return (
    <div className="space-y-4 animate-in fade-in">
      <PageHeader
        title="Relative Management"
        description="Manage all relatives linked to patients and appointments."
        actions={
          <Button onClick={openCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Relative
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={relatives}
        searchColumnId="firstname"
        searchPlaceholder="Search by first name..."
      />

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Relative</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="rel-fn">First Name *</Label>
                <Input
                  id="rel-fn"
                  value={form.firstname}
                  onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))}
                  placeholder="Jane"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="rel-ln">Last Name *</Label>
                <Input
                  id="rel-ln"
                  value={form.lastname}
                  onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="rel-pronoun">Pronoun</Label>
              <Input
                id="rel-pronoun"
                value={form.pronoun ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, pronoun: e.target.value }))}
                placeholder="they/them"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rel-notes">Notes</Label>
              <Textarea
                id="rel-notes"
                value={form.notes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateSubmit}
              disabled={isCreating || !form.firstname.trim() || !form.lastname.trim()}
            >
              {isCreating ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) setEditTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Relative</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="edit-rel-fn">First Name *</Label>
                <Input
                  id="edit-rel-fn"
                  value={form.firstname}
                  onChange={(e) => setForm((f) => ({ ...f, firstname: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-rel-ln">Last Name *</Label>
                <Input
                  id="edit-rel-ln"
                  value={form.lastname}
                  onChange={(e) => setForm((f) => ({ ...f, lastname: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-rel-pronoun">Pronoun</Label>
              <Input
                id="edit-rel-pronoun"
                value={form.pronoun ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, pronoun: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-rel-notes">Notes</Label>
              <Textarea
                id="edit-rel-notes"
                value={form.notes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button
              onClick={handleEditSubmit}
              disabled={isUpdating || !form.firstname.trim() || !form.lastname.trim()}
            >
              {isUpdating ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
