"use client";

import { Building2, Loader2, Save, UserPlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrganizationDialogFieldLabel } from "@/components/control-panel/organization-dialog/OrganizationDialogFieldLabel";
import {
  organizationDialogFooterStripClass,
  organizationDialogGlassBackButtonClass,
  organizationDialogGlassInputClass,
  organizationDialogHeaderIconTileClass,
  organizationDialogShellClass,
} from "@/lib/organization-dialog-ui-classes";
import {
  indigoGlassPrimaryButtonClass,
} from "@/lib/calendar-header-action-styles";
import { cn, toTitleCaseLabel } from "@/lib/utils";

export type OrganizationFormValues = {
  name: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  form: OrganizationFormValues;
  onFormChange: (patch: Partial<OrganizationFormValues>) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
};

/** Indigo glass create/edit organization — mandatory name field + icon footer actions. */
export function OrganizationFormDialog({
  open,
  onOpenChange,
  mode,
  form,
  onFormChange,
  onSubmit,
  isSubmitting,
}: Props) {
  const isEdit = mode === "edit";
  const canSubmit = form.name.trim().length > 0;
  const SubmitIcon = isEdit ? Save : UserPlus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(organizationDialogShellClass, "border-0 p-0")}>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-indigo-200/60 bg-indigo-50/40 px-6 py-4">
            <div className="flex items-start gap-3">
              <div className={organizationDialogHeaderIconTileClass} aria-hidden>
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  {isEdit ? toTitleCaseLabel("Update Organization") : toTitleCaseLabel("Create Organization")}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {isEdit
                    ? "Rename the clinic or hospital organisation."
                    : "Add a new organisation for billing and member access."}
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-1.5">
              <OrganizationDialogFieldLabel htmlFor="org-name" icon={Building2} required>
                {toTitleCaseLabel("Organization Name")}
              </OrganizationDialogFieldLabel>
              <Input
                id="org-name"
                className={organizationDialogGlassInputClass}
                placeholder="e.g. HealthCal Demo Clinic"
                value={form.name}
                onChange={(e) => onFormChange({ name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={organizationDialogFooterStripClass}>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                className={cn(organizationDialogGlassBackButtonClass, "rounded-full")}
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
                  indigoGlassPrimaryButtonClass,
                  "rounded-full disabled:pointer-events-none disabled:opacity-50"
                )}
                onClick={onSubmit}
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                    {toTitleCaseLabel(isEdit ? "Saving…" : "Creating…")}
                  </>
                ) : (
                  <>
                    <SubmitIcon className="size-4 shrink-0" aria-hidden />
                    {toTitleCaseLabel(isEdit ? "Save Changes" : "Create Organization")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
