"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { useCategories } from "@/hooks/useCategories";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/types";
import { Plus, Pencil, MoreHorizontal, Trash2, Eye } from "lucide-react";
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
import type { CategoryCreateInput } from "@/hooks/useCategories";

function CategoryActions({
  category,
  onDelete,
}: {
  category: Category;
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
            <PrefetchingLink
              href={`/control-panel/categories/${category.id}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              View
            </PrefetchingLink>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <PrefetchingLink
              href={`/control-panel/categories/${category.id}?mode=edit`}
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

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>&ldquo;{category.label}&rdquo;</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => onDelete(category.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function CategoryManagement() {
  const { categories, isLoading, createCategory, isCreating, deleteCategory } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CategoryCreateInput>({
    label: "",
    description: "",
    color: "#6366f1",
    icon: "",
  });

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "label",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Label" />,
      cell: ({ row }) => (
        <EntityTitleLink
          href={`/control-panel/categories/${row.original.id}`}
          label={row.original.label}
          className="font-medium"
        />
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
      cell: ({ row }) => row.original.description ?? "—",
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.color && (
            <input
              type="color"
              title="Category color"
              value={row.original.color}
              readOnly
              disabled
              className="h-4 w-5 rounded border p-0"
            />
          )}
          <span className="text-xs font-mono">{row.original.color ?? "—"}</span>
        </div>
      ),
    },
    { accessorKey: "icon", header: "Icon", cell: ({ row }) => row.original.icon ?? "—" },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      cell: ({ row }) =>
        row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "—",
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      cell: ({ row }) =>
        row.original.updated_at ? new Date(row.original.updated_at).toLocaleDateString() : "—",
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <CategoryActions category={row.original} onDelete={deleteCategory} />
      ),
    },
  ];

  const handleCreate = () => {
    createCategory(
      { ...form, label: form.label.trim() },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({ label: "", description: "", color: "#6366f1", icon: "" });
        },
      }
    );
  };

  return (
    <div className="space-y-2">
      <PageHeader
        title="Category Management"
        description="Manage appointment categories. All table schema properties are shown."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add category
          </Button>
        }
      />

      <DataTable<Category, unknown>
        columns={columns}
        data={categories}
        isLoading={isLoading}
        globalFilterFn={(row, q) => {
          const s = q.trim().toLowerCase();
          if (!s) return true;
          const c = row;
          return `${c.label} ${c.description ?? ""}`.toLowerCase().includes(s);
        }}
        searchPlaceholder="Search by label or description…"
        emptyMessage="No categories yet. Add one to get started."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Label *</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                placeholder="Category label"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={form.description ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    title="Pick a color"
                    value={form.color ?? "#6366f1"}
                    onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                    className="h-9 w-12 cursor-pointer rounded border p-1"
                  />
                  <Input
                    value={form.color ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                    placeholder="#hex or name"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <Input
                  value={form.icon ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="Icon name"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isCreating || !form.label.trim()}>
              {isCreating ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

