"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Clock,
  Hash,
  LayoutGrid,
  Loader2,
  Palette,
  Pencil,
  Save,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryDialogFieldLabel } from "@/components/control-panel/category-dialog/CategoryDialogFieldLabel";
import { CategoryIconPickerSelect } from "@/components/shared/category-display/CategoryIconPickerSelect";
import type { CategoryCreateInput } from "@/hooks/useCategories";
import {
  categoryDialogGlassBackButtonClass,
  categoryDialogGlassInputClass,
  categoryDialogGlassSelectTriggerClass,
  categoryDialogGlassTextareaClass,
  categoryDialogShellClass,
} from "@/lib/category-dialog-ui-classes";
import { violetGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { cn, toTitleCaseLabel } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  form: CategoryCreateInput;
  onFormChange: (patch: Partial<CategoryCreateInput>) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
};

/**
 * Add/Edit category — violet glass shell (90vh). State stays in parent for centralized mutations.
 */
export function CategoryFormDialog({
  open,
  onOpenChange,
  mode = "create",
  form,
  onFormChange,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const isEdit = mode === "edit";
  const HeaderIcon = isEdit ? Pencil : Tag;
  const SubmitIcon = isEdit ? Save : Sparkles;
  const canSubmit = Boolean(form.label.trim()) && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={categoryDialogShellClass}>
        <div className="shrink-0 bg-white pt-6 text-gray-700">
          <div className="px-6">
            <div className="flex items-start gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-200/70 bg-violet-50 text-violet-700">
                <HeaderIcon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-left text-lg font-semibold text-gray-700">
                  {isEdit ? toTitleCaseLabel("Edit Category") : toTitleCaseLabel("Add Category")}
                </DialogTitle>
                <DialogDescription className="text-left text-sm text-muted-foreground">
                  {isEdit
                    ? toTitleCaseLabel("Update label, display order, duration, and active status.")
                    : toTitleCaseLabel(
                      "Required: label. Inactive categories stay visible in lists but not in new booking selects."
                    )}
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-violet-100 hover:text-violet-800"
                >
                  <X className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
          </div>
          <div className="mx-6 mt-4 border-b border-violet-200/60" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-gray-700">
          <div className="grid grid-cols-1 gap-4">
            <FieldBlock icon={Tag} htmlFor="cf-label" label="Label" required>
              <Input
                id="cf-label"
                value={form.label}
                onChange={(e) => onFormChange({ label: e.target.value })}
                placeholder="Category label"
                className={categoryDialogGlassInputClass}
              />
            </FieldBlock>

            <FieldBlock icon={LayoutGrid} htmlFor="cf-description" label="Description">
              <Textarea
                id="cf-description"
                rows={3}
                value={form.description ?? ""}
                onChange={(e) => onFormChange({ description: e.target.value })}
                placeholder="Optional description for staff and patients"
                className={categoryDialogGlassTextareaClass}
              />
            </FieldBlock>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldBlock icon={Palette} label="Color">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    title="Pick a color"
                    value={form.color ?? "#f59e0b"}
                    onChange={(e) => onFormChange({ color: e.target.value })}
                    className="h-11 w-14 cursor-pointer rounded-2xl border border-violet-200/50 p-1 shadow-[0_8px_24px_rgba(139,92,246,0.14)]"
                  />
                  <Input
                    value={form.color ?? ""}
                    onChange={(e) => onFormChange({ color: e.target.value })}
                    placeholder="#hex"
                    className={cn(categoryDialogGlassInputClass, "flex-1")}
                  />
                </div>
              </FieldBlock>
              <FieldBlock icon={Sparkles} label="Icon">
                <CategoryIconPickerSelect
                  value={form.icon}
                  onValueChange={(icon) => onFormChange({ icon })}
                />
              </FieldBlock>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldBlock icon={Clock} htmlFor="cf-duration" label="Default Duration (Min)">
                <Input
                  id="cf-duration"
                  type="number"
                  min={5}
                  value={form.duration_minutes_default ?? ""}
                  onChange={(e) =>
                    onFormChange({
                      duration_minutes_default: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  placeholder="e.g. 30"
                  className={categoryDialogGlassInputClass}
                />
              </FieldBlock>
              <FieldBlock icon={Hash} htmlFor="cf-sort" label="Display Order">
                <Input
                  id="cf-sort"
                  type="number"
                  value={form.sort_order ?? 0}
                  onChange={(e) => onFormChange({ sort_order: Number(e.target.value) })}
                  className={categoryDialogGlassInputClass}
                />
              </FieldBlock>
            </div>

            <FieldBlock icon={Activity} label="Status">
              <Select
                value={form.is_active !== false ? "true" : "false"}
                onValueChange={(v) => onFormChange({ is_active: v === "true" })}
              >
                <SelectTrigger className={categoryDialogGlassSelectTriggerClass}>
                  <SelectValue placeholder="Active" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FieldBlock>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-violet-200/60 bg-violet-50/40 px-6 py-3">
          <Button
            type="button"
            variant="ghost"
            className={cn(categoryDialogGlassBackButtonClass, "cursor-pointer rounded-full")}
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            <X className="size-4 shrink-0" aria-hidden />
            {toTitleCaseLabel("Cancel")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              violetGlassPrimaryButtonClass,
              "cursor-pointer rounded-full disabled:pointer-events-none disabled:opacity-50"
            )}
            onClick={onSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                {toTitleCaseLabel(isEdit ? "Saving…" : "Creating…")}
              </>
            ) : (
              <>
                <SubmitIcon className="size-4 shrink-0" aria-hidden />
                {toTitleCaseLabel(isEdit ? "Update Category" : "Create Category")}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({
  icon,
  htmlFor,
  label,
  required,
  children,
}: {
  icon: LucideIcon;
  htmlFor?: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <CategoryDialogFieldLabel htmlFor={htmlFor} icon={icon} required={required}>
        {toTitleCaseLabel(label)}
      </CategoryDialogFieldLabel>
      {children}
    </div>
  );
}
