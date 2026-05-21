"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { PrefetchingLink } from "@/components/shared/PrefetchingLink";
import { useCategories } from "@/hooks/useCategories";
import { DataTable } from "@/components/shared/DataTable";
import { DataTableColumnHeader } from "@/components/shared/DataTableColumnHeader";
import { PageHeader } from "@/components/shared/PageHeader";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Category } from "@/types/types";
import { cn } from "@/lib/utils";
import { skyGlassTableFrameClass, emeraldGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { Plus, Pencil, MoreHorizontal, Trash2, Eye, Layers, CheckCircle2, Clock, Tag, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import type { CategoryCreateInput } from "@/hooks/useCategories";

// ---------------------------------------------------------------------------
// Stat cards — amber/orange color scheme; only numeric values pulse during load
// ---------------------------------------------------------------------------
function CategoryStatCards({ categories, isLoading }: { categories: Category[]; isLoading: boolean }) {
  const active = categories.filter((c) => c.is_active !== false).length;
  const withDuration = categories.filter((c) => c.duration_minutes_default != null).length;

  const stats = [
    {
      label: "Total Categories",
      value: categories.length,
      icon: <Tag className="h-4 w-4" />,
      cls: "bg-amber-50/60 border-amber-200/60",
      valueCls: "text-amber-700",
      iconCls: "bg-amber-100 border-amber-200 text-amber-600",
    },
    {
      label: "Active",
      value: active,
      icon: <CheckCircle2 className="h-4 w-4" />,
      cls: "bg-emerald-50/60 border-emerald-200/60",
      valueCls: "text-emerald-700",
      iconCls: "bg-emerald-100 border-emerald-200 text-emerald-600",
    },
    {
      label: "With Duration",
      value: withDuration,
      icon: <Clock className="h-4 w-4" />,
      cls: "bg-sky-50/60 border-sky-200/60",
      valueCls: "text-sky-700",
      iconCls: "bg-sky-100 border-sky-200 text-sky-600",
    },
    {
      label: "Inactive",
      value: categories.length - active,
      icon: <Layers className="h-4 w-4" />,
      cls: "bg-slate-50/60 border-slate-200/60",
      valueCls: "text-slate-700",
      iconCls: "bg-slate-100 border-slate-200 text-slate-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {stats.map(({ label, value, icon, cls, valueCls, iconCls }) => (
        <Card key={label} className={cn("rounded-[16px] border", cls)}>
          <CardContent className="p-3 flex items-center gap-2">
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl border shrink-0", iconCls)}>
              {icon}
            </span>
            <div>
              {/* Only pulse the numeric value — label + icon stay fixed during load */}
              {isLoading
                ? <Skeleton className="h-5 w-8 rounded mb-1" />
                : <p className={cn("text-lg font-bold leading-none", valueCls)}>{value}</p>
              }
              <p className="text-xs text-muted-foreground ">{label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

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
  const { categories, isLoading, isError, createCategory, isCreating, deleteCategory } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<CategoryCreateInput>({
    label: "",
    description: "",
    color: "#f59e0b",
    icon: "",
    is_active: true,
    sort_order: 0,
    duration_minutes_default: undefined,
  });

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "label",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Label" />,
      meta: { shellClassName: "min-w-[10rem]" },
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-2">
            {c.color && (
              <span className="h-3 w-3 rounded-full border shrink-0" style={{ background: c.color }} />
            )}
            <EntityTitleLink href={`/control-panel/categories/${c.id}`} label={c.label} className="font-medium" />
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      meta: { shellClassName: "min-w-[12rem]" },
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
          {row.original.description ?? "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      meta: { shellClassName: "w-[7rem]" },
      cell: ({ row }) => {
        const active = row.original.is_active !== false;
        return (
          <Badge variant="outline" className={`text-[10px] py-0 ${active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
            {active ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "duration",
      header: "Default Duration",
      meta: { shellClassName: "w-[9rem] text-right" },
      cell: ({ row }) => {
        const d = row.original.duration_minutes_default;
        return d != null ? (
          <Badge variant="outline" className="text-[10px] py-0 bg-sky-50 text-sky-700 border-sky-200">
            <Clock className="h-2.5 w-2.5 mr-0.5" />{d} min
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "sort_order",
      header: "Order",
      meta: { shellClassName: "w-[5rem] text-center" },
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.sort_order ?? 0}</span>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
      meta: { shellClassName: "w-[1%] whitespace-nowrap" },
      cell: ({ row }) => (
        <span className="text-xs">{row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "—"}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      meta: { shellClassName: "w-[1%] whitespace-nowrap text-right" },
      cell: ({ row }) => <CategoryActions category={row.original} onDelete={deleteCategory} />,
    },
  ];

  const handleCreate = () => {
    createCategory(
      { ...form, label: form.label.trim() },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({ label: "", description: "", color: "#f59e0b", icon: "", is_active: true, sort_order: 0 });
        },
      }
    );
  };

  if (isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Category Management" description="Manage appointment categories with status, duration, and display order." />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-60" />
          Failed to load categories. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Category Management"
        description="Manage appointment categories with status, duration, and display order."
        actions={
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className={emeraldGlassPrimaryButtonClass}
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        }
      />

      <CategoryStatCards categories={categories} isLoading={isLoading} />

      <div className={cn("rounded-2xl overflow-hidden", skyGlassTableFrameClass)}>
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
          tableClassName="min-w-[800px]"
          tableLayout="auto"
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription className="sr-only">
              Create a scheduling category with label, optional description, color, and sort order.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Label *</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                placeholder="Category label"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    title="Pick a color"
                    value={form.color ?? "#f59e0b"}
                    onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                    className="h-9 w-12 cursor-pointer rounded border p-1"
                  />
                  <Input
                    value={form.color ?? ""}
                    onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                    placeholder="#hex"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Icon</Label>
                <Input
                  value={form.icon ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="lucide icon name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label>Default Duration (min)</Label>
                <Input
                  type="number"
                  min={5}
                  value={form.duration_minutes_default ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, duration_minutes_default: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="e.g. 30"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sort_order ?? 0}
                  onChange={(e) => setForm((p) => ({ ...p, sort_order: Number(e.target.value) }))}
                  placeholder="0"
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

