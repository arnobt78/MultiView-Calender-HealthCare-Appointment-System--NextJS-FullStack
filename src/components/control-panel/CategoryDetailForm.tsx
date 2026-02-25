"use client";

import { Category } from "@/types/types";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CategoryDetailForm({ category }: { category: Category }) {
  const router = useRouter();
  const { updateCategory, isUpdating, deleteCategory, isDeleting } = useCategories();
  const [form, setForm] = useState({
    label: category.label,
    description: category.description ?? "",
    color: category.color ?? "",
    icon: category.icon ?? "",
  });

  const handleSave = () => {
    updateCategory({
      id: category.id,
      label: form.label,
      description: form.description || undefined,
      color: form.color || undefined,
      icon: form.icon || undefined,
    });
  };

  const handleDelete = () => {
    if (confirm("Delete this category? Appointments using it may be affected.")) {
      deleteCategory(category.id, { onSuccess: () => router.push("/control-panel") });
    }
  };

  return (
    <div className="border-t pt-4 space-y-4">
      <h4 className="font-medium">Edit</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Label</Label>
          <Input value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Color</Label>
          <Input value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Icon</Label>
          <Input value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isUpdating}>{isUpdating ? "Saving..." : "Save"}</Button>
        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? "Deleting..." : "Delete"}</Button>
      </div>
    </div>
  );
}
