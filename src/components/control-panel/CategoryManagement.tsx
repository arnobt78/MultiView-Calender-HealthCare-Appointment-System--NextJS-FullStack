"use client";

import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Category } from "@/types/types";
import { Plus, Pencil } from "lucide-react";
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
import type { CategoryCreateInput } from "@/hooks/useCategories";

const columns: ColumnDef<Category>[] = [
  {
    accessorKey: "label",
    header: "Label",
    cell: ({ row }) => row.original.label,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original.description ?? "—",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.color && (
          <span
            className="inline-block h-4 w-5 rounded border"
            style={{ backgroundColor: row.original.color }}
          />
        )}
        <span>{row.original.color ?? "—"}</span>
      </div>
    ),
  },
  {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }) => row.original.icon ?? "—",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) =>
      row.original.created_at
        ? new Date(row.original.created_at).toLocaleDateString()
        : "—",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/control-panel/categories/${id}`} aria-label="View category">
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
      );
    },
  },
];

export default function CategoryManagement() {
  const { categories, isLoading, createCategory, isCreating } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CategoryCreateInput>({
    label: "",
    description: "",
    color: "",
    icon: "",
  });

  const handleCreate = () => {
    createCategory(
      { ...form, label: form.label.trim() },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({ label: "", description: "", color: "", icon: "" });
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Category Management"
        description="View and manage categories. All table schema properties are shown."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add category
          </Button>
        }
      />
      <DataTable<Category, unknown>
        columns={columns}
        data={categories}
        isLoading={isLoading}
        searchColumnId="label"
        searchPlaceholder="Search by label..."
        emptyMessage="No categories yet. Add one to get started."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Label</Label>
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
                <Input
                  type="text"
                  value={form.color ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                  placeholder="#hex or name"
                />
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !form.label.trim()}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
