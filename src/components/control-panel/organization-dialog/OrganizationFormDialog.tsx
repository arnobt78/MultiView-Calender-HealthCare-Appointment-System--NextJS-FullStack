"use client";

import { Building2, Loader2, Save, UserPlus, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrganizationDialogFieldLabel } from "@/components/control-panel/organization-dialog/OrganizationDialogFieldLabel";
import { OrganizationDialogHeader } from "@/components/control-panel/organization-dialog/OrganizationDialogHeader";
import { OrganizationMemberPickerField } from "@/components/control-panel/organization-dialog/OrganizationMemberPickerField";
import {
  organizationDialogFooterStripClass,
  organizationDialogGlassBackButtonClass,
  organizationDialogGlassInputClass,
  organizationDialogShellClass,
} from "@/lib/organization-dialog-ui-classes";
import { indigoGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { cn, toTitleCaseLabel } from "@/lib/utils";

export type OrganizationFormValues = {
  name: string;
  initialAdminId?: string;
  initialDoctorId?: string;
  initialPatientId?: string;
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

/** Indigo glass create/edit organization — optional initial members on create. */
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
  const HeaderIcon = isEdit ? Save : Building2;

  const otherPickedIds = [
    form.initialAdminId,
    form.initialDoctorId,
    form.initialPatientId,
  ].filter(Boolean) as string[];

  function excludeExcept(current?: string) {
    return otherPickedIds.filter((id) => id !== current);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(organizationDialogShellClass, "border-0 p-0")}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <OrganizationDialogHeader
            icon={HeaderIcon}
            title={
              isEdit
                ? toTitleCaseLabel("Update Organization")
                : toTitleCaseLabel("Create Organization")
            }
            description={
              isEdit
                ? "Rename the clinic or hospital organisation."
                : "Add a new organisation for billing and member access."
            }
          />

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
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

              {!isEdit ? (
                <div className="space-y-3 border-t border-indigo-100/80 pt-4">
                  <p className="text-sm font-medium text-gray-800">
                    {toTitleCaseLabel("Optional Initial Members")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You are added as admin automatically. Pick additional portal members now or
                    add them later from the org detail page.
                  </p>
                  <OrganizationMemberPickerField
                    key={`admin-picker-${open}`}
                    dialogOpen={open}
                    value={form.initialAdminId ?? ""}
                    onValueChange={(id) =>
                      onFormChange({ initialAdminId: id || undefined })
                    }
                    roleFilter="admin"
                    excludeUserIds={excludeExcept(form.initialAdminId)}
                    disabled={isSubmitting}
                    clearable
                    label={toTitleCaseLabel("Admin Member")}
                    placeholder={toTitleCaseLabel("Choose an admin (optional)")}
                  />
                  <OrganizationMemberPickerField
                    key={`doctor-picker-${open}`}
                    dialogOpen={open}
                    value={form.initialDoctorId ?? ""}
                    onValueChange={(id) =>
                      onFormChange({ initialDoctorId: id || undefined })
                    }
                    roleFilter="doctor"
                    excludeUserIds={excludeExcept(form.initialDoctorId)}
                    disabled={isSubmitting}
                    clearable
                    label={toTitleCaseLabel("Doctor Member")}
                    placeholder={toTitleCaseLabel("Choose a doctor (optional)")}
                  />
                  <OrganizationMemberPickerField
                    key={`patient-picker-${open}`}
                    dialogOpen={open}
                    value={form.initialPatientId ?? ""}
                    onValueChange={(id) =>
                      onFormChange({ initialPatientId: id || undefined })
                    }
                    roleFilter="patient"
                    excludeUserIds={excludeExcept(form.initialPatientId)}
                    disabled={isSubmitting}
                    clearable
                    label={toTitleCaseLabel("Patient Member")}
                    placeholder={toTitleCaseLabel("Choose a patient (optional)")}
                  />
                </div>
              ) : null}
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
