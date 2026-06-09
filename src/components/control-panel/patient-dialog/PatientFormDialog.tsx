"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  CalendarDays,
  FileText,
  Loader2,
  Mail,
  Phone,
  MessageSquare,
  Stethoscope,
  Pencil,
  Save,
  UserPlus,
  UserRound,
  Users,
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
import { PatientDialogFieldLabel } from "@/components/control-panel/patient-dialog/PatientDialogFieldLabel";
import { PatientPrimaryDoctorPickerField } from "@/components/control-panel/patient-dialog/PatientPrimaryDoctorPickerField";
import { PatientCareLevelSelect } from "@/components/control-panel/PatientCareLevelSelect";
import { ClinicalGlassDatePicker } from "@/components/shared/scheduling/ClinicalGlassDatePicker";
import type { PatientCreateInput } from "@/hooks/usePatients";
import { PATIENT_REFERRAL_SOURCES } from "@/lib/patient-referral-sources";
import {
  patientDialogGlassBackButtonClass,
  patientDialogGlassInputClass,
  patientDialogGlassSelectTriggerClass,
  patientDialogGlassTextareaClass,
  patientDialogShellClass,
} from "@/lib/patient-dialog-ui-classes";
import { emeraldGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import type { PatientFormDialogExtra } from "@/lib/patient-form-clinical";
import { cn, toTitleCaseLabel } from "@/lib/utils";

export type { PatientFormDialogExtra } from "@/lib/patient-form-clinical";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  /** Edit mode — email shown read-only (API does not persist email on PUT). */
  readOnlyEmail?: string | null;
  form: PatientCreateInput;
  onFormChange: (patch: Partial<PatientCreateInput>) => void;
  createExtra: PatientFormDialogExtra;
  onCreateExtraChange: (patch: Partial<PatientFormDialogExtra>) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
};

/**
 * Add/Edit patient — emerald glass shell + field chrome aligned with staff appointment dialog.
 * State stays in parent (`PatientManagement`) so mutations + invalidation remain centralized.
 */
export function PatientFormDialog({
  open,
  onOpenChange,
  mode = "create",
  readOnlyEmail,
  form,
  onFormChange,
  createExtra,
  onCreateExtraChange,
  onSubmit,
  isSubmitting = false,
}: Props) {
  const isEdit = mode === "edit";
  const HeaderIcon = isEdit ? Pencil : UserPlus;
  const SubmitIcon = isEdit ? Save : UserPlus;
  const canSubmit = Boolean(form.firstname.trim() && form.lastname.trim()) && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={patientDialogShellClass}>
        <div className="shrink-0 bg-white pt-6 text-gray-700">
          <div className="px-6">
            <div className="flex items-start gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/70 bg-emerald-50 text-emerald-700">
                <HeaderIcon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-left text-lg font-semibold text-gray-700">
                  {isEdit ? toTitleCaseLabel("Edit Patient") : toTitleCaseLabel("Add Patient")}
                </DialogTitle>
                <DialogDescription className="text-left text-sm text-muted-foreground">
                  {isEdit
                    ? toTitleCaseLabel("Update demographics, care team, and clinical context.")
                    : toTitleCaseLabel(
                      "Required: first and last name. Optional fields help scheduling and records stay accurate."
                    )}
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-emerald-100 hover:text-emerald-800"
                >
                  <X className="h-4 w-4" aria-hidden />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
          </div>
          <div className="mx-6 mt-4 border-b border-emerald-200/60" />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-gray-700">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldBlock icon={UserRound} htmlFor="pf-firstname" label="First Name" required>
                <Input
                  id="pf-firstname"
                  value={form.firstname}
                  onChange={(e) => onFormChange({ firstname: e.target.value })}
                  placeholder="First name"
                  className={patientDialogGlassInputClass}
                />
              </FieldBlock>
              <FieldBlock icon={Users} htmlFor="pf-lastname" label="Last Name" required>
                <Input
                  id="pf-lastname"
                  value={form.lastname}
                  onChange={(e) => onFormChange({ lastname: e.target.value })}
                  placeholder="Last name"
                  className={patientDialogGlassInputClass}
                />
              </FieldBlock>
            </div>

            <FieldBlock
              icon={Mail}
              htmlFor="pf-email"
              label={isEdit ? "Email (Read-Only)" : "Email"}
            >
              <Input
                id="pf-email"
                type="email"
                value={isEdit ? (readOnlyEmail ?? form.email ?? "") : (form.email ?? "")}
                onChange={(e) => onFormChange({ email: e.target.value })}
                placeholder="name@example.com"
                readOnly={isEdit}
                className={cn(
                  patientDialogGlassInputClass,
                  isEdit && "cursor-default bg-emerald-50/50 text-muted-foreground"
                )}
              />
            </FieldBlock>

            {/* Contact phone — persisted on POST/PUT; used for SMS reminders when user.phone is absent. */}
            <FieldBlock icon={Phone} htmlFor="pf-phone" label="Phone">
              <Input
                id="pf-phone"
                type="tel"
                autoComplete="tel"
                value={form.phone ?? ""}
                onChange={(e) => onFormChange({ phone: e.target.value })}
                placeholder="+49 170 1234567"
                className={patientDialogGlassInputClass}
              />
            </FieldBlock>

            <PatientPrimaryDoctorPickerField
              dialogOpen={open}
              value={createExtra.primaryDoctorId}
              onValueChange={(id) => onCreateExtraChange({ primaryDoctorId: id })}
              disabled={isSubmitting}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldBlock icon={CalendarDays} htmlFor="pf-birth-date" label="Select Birth Date">
                <ClinicalGlassDatePicker
                  id="pf-birth-date"
                  value={form.birth_date ?? ""}
                  onChange={(iso) => onFormChange({ birth_date: iso })}
                  tone="sky"
                  align="end"
                  placeholder="Select birth date"
                  disabled={isSubmitting}
                />
              </FieldBlock>
              <FieldBlock icon={Activity} htmlFor="pf-care-level" label="Select Care Level (1–10)">
                <PatientCareLevelSelect
                  id="pf-care-level"
                  value={form.care_level}
                  onValueChange={(next) => onFormChange({ care_level: next })}
                  aria-label="Care level tier from 1 to 10"
                  className={patientDialogGlassSelectTriggerClass}
                />
              </FieldBlock>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FieldBlock icon={UserRound} label="Select Pronoun">
                <Select
                  value={form.pronoun ?? ""}
                  onValueChange={(v) => onFormChange({ pronoun: v })}
                >
                  <SelectTrigger className={patientDialogGlassSelectTriggerClass}>
                    <SelectValue placeholder="Pronoun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="he/him">He/Him</SelectItem>
                    <SelectItem value="she/her">She/Her</SelectItem>
                    <SelectItem value="they/them">They/Them</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FieldBlock>
              <FieldBlock icon={Activity} label="Select Status">
                <Select
                  value={form.active ? "true" : "false"}
                  onValueChange={(v) => onFormChange({ active: v === "true" })}
                >
                  <SelectTrigger className={patientDialogGlassSelectTriggerClass}>
                    <SelectValue placeholder="Active" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </FieldBlock>
            </div>

            <FieldBlock icon={FileText} label="Select Referral / Intake">
              <Select
                value={createExtra.referralSource}
                onValueChange={(v) => onCreateExtraChange({ referralSource: v })}
              >
                <SelectTrigger className={patientDialogGlassSelectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PATIENT_REFERRAL_SOURCES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>

            {(createExtra.referralSource === "external_partner" ||
              createExtra.referralSource === "other") && (
                <FieldBlock icon={MessageSquare} htmlFor="pf-referral-detail" label="Referral Detail">
                  <Input
                    id="pf-referral-detail"
                    title="Referral detail"
                    value={createExtra.referralDetail}
                    onChange={(e) => onCreateExtraChange({ referralDetail: e.target.value })}
                    placeholder="Clinic, referrer, or how they reached you"
                    className={patientDialogGlassInputClass}
                  />
                </FieldBlock>
              )}

            <FieldBlock icon={Activity} htmlFor="pf-allergies" label="Allergies (Comma-Separated)">
              <Input
                id="pf-allergies"
                title="Allergies"
                value={createExtra.allergiesCsv}
                onChange={(e) => onCreateExtraChange({ allergiesCsv: e.target.value })}
                placeholder="e.g. penicillin, latex"
                className={patientDialogGlassInputClass}
              />
            </FieldBlock>

            <FieldBlock icon={FileText} htmlFor="pf-clinical-notes" label="Clinical Notes">
              <Textarea
                id="pf-clinical-notes"
                title="Clinical notes"
                rows={3}
                value={createExtra.clinicalNotes}
                onChange={(e) => onCreateExtraChange({ clinicalNotes: e.target.value })}
                placeholder="Short clinical context for the team"
                className={patientDialogGlassTextareaClass}
              />
            </FieldBlock>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-emerald-200/60 bg-emerald-50/40 px-6 py-3">
          <Button
            type="button"
            variant="ghost"
            className={cn(patientDialogGlassBackButtonClass, "cursor-pointer rounded-full")}
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
              emeraldGlassPrimaryButtonClass,
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
                {toTitleCaseLabel(isEdit ? "Update Patient" : "Create Patient")}
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
      <PatientDialogFieldLabel htmlFor={htmlFor} icon={icon} required={required}>
        {toTitleCaseLabel(label)}
      </PatientDialogFieldLabel>
      {children}
    </div>
  );
}
