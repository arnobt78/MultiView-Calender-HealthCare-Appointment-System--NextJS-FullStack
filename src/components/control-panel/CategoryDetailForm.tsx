"use client";

/**
 * @deprecated Use `CategoryFormDialog` from `./category-dialog/CategoryFormDialog` instead.
 * Kept for backward compatibility — thin adapter around the violet glass dialog.
 */
import { Category } from "@/types/types";
import { useCategories } from "@/hooks/useCategories";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CategoryFormDialog } from "@/components/control-panel/category-dialog/CategoryFormDialog";
import { categoryToFormInput } from "@/lib/category-form-state";

export function CategoryDetailForm({ category }: { category: Category }) {
  const router = useRouter();
  const { updateCategory, isUpdating } = useCategories();
  const [open, setOpen] = useState(true);
  const [form, setForm] = useState(() => categoryToFormInput(category));

  return (
    <CategoryFormDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) router.back();
      }}
      mode="edit"
      form={form}
      onFormChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
      onSubmit={() => {
        updateCategory(
          {
            id: category.id,
            ...form,
            label: form.label.trim(),
            description: form.description?.trim() || undefined,
            icon: form.icon?.trim() || undefined,
          },
          { onSuccess: () => setOpen(false) }
        );
      }}
      isSubmitting={isUpdating}
    />
  );
}
