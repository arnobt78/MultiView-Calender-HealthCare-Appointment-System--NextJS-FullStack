"use client";

import {
  Building2,
  FileText,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  Stethoscope,
  UserRound,
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
import { DoctorDialogFieldLabel } from "@/components/control-panel/doctor-dialog/DoctorDialogFieldLabel";
import type { DoctorFormValues } from "@/lib/doctor-form-state";
import {
  doctorDialogGlassBackButtonClass,
  doctorDialogGlassInputClass,
  doctorDialogGlassSelectTriggerClass,
  doctorDialogGlassTextareaClass,
  doctorDialogShellClass,
} from "@/lib/doctor-dialog-ui-classes";
import { emeraldGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { SPECIALTIES } from "@/lib/doctor-specialty";
import { cn, toTitleCaseLabel } from "@/lib/utils";

type DoctorFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnlyEmail: string;
  form: DoctorFormValues;
  onFormChange: (patch: Partial<DoctorFormValues>) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
};

/** Edit-only doctor profile — emerald glass shell; parent owns mutation + invalidation. */
export function DoctorFormDialog({
  open,
  onOpenChange,
  readOnlyEmail,
  form,
  onFormChange,
  onSubmit,
  isSubmitting = false,
}: DoctorFormDialogProps) {
  const canSubmit = Boolean(form.display_name.trim()) && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className={doctorDialogShellClass}>
        <div className="shrink-0 bg-white pt-6 text-gray-700">
          <div className="px-6">
            <div className="flex items-start gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/70 bg-emerald-50 text-emerald-700">
                <Pencil className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-left text-xl font-semibold text-gray-700">
                  {toTitleCaseLabel("Edit Doctor Profile")}
                </DialogTitle>
                <DialogDescription className="text-left text-sm text-muted-foreground">
                  {toTitleCaseLabel(
                    "Update specialty, contact details, and active status. Email is fixed for this demo account."
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
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 text-gray-700">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <DoctorDialogFieldLabel htmlFor="doctor_email" icon={Mail}>
                Email
              </DoctorDialogFieldLabel>
              <Input
                id="doctor_email"
                value={readOnlyEmail}
                readOnly
                className={cn(doctorDialogGlassInputClass, "opacity-80")}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <DoctorDialogFieldLabel htmlFor="doctor_display_name" icon={UserRound} required>
                Display Name
              </DoctorDialogFieldLabel>
              <Input
                id="doctor_display_name"
                value={form.display_name}
                onChange={(e) => onFormChange({ display_name: e.target.value })}
                className={doctorDialogGlassInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <DoctorDialogFieldLabel htmlFor="doctor_specialty" icon={Stethoscope}>
                Specialty
              </DoctorDialogFieldLabel>
              <Select value={form.specialty} onValueChange={(v) => onFormChange({ specialty: v })}>
                <SelectTrigger id="doctor_specialty" className={doctorDialogGlassSelectTriggerClass}>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <DoctorDialogFieldLabel htmlFor="doctor_phone" icon={Phone}>
                Phone
              </DoctorDialogFieldLabel>
              <Input
                id="doctor_phone"
                value={form.phone}
                onChange={(e) => onFormChange({ phone: e.target.value })}
                className={doctorDialogGlassInputClass}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <DoctorDialogFieldLabel htmlFor="doctor_bio" icon={FileText}>
                Bio
              </DoctorDialogFieldLabel>
              <Textarea
                id="doctor_bio"
                value={form.bio}
                onChange={(e) => onFormChange({ bio: e.target.value })}
                className={doctorDialogGlassTextareaClass}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <DoctorDialogFieldLabel htmlFor="doctor_license" icon={Hash}>
                License Number
              </DoctorDialogFieldLabel>
              <Input
                id="doctor_license"
                value={form.license_number}
                onChange={(e) => onFormChange({ license_number: e.target.value })}
                className={doctorDialogGlassInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <DoctorDialogFieldLabel htmlFor="doctor_department" icon={Building2}>
                Department
              </DoctorDialogFieldLabel>
              <Input
                id="doctor_department"
                value={form.department}
                onChange={(e) => onFormChange({ department: e.target.value })}
                className={doctorDialogGlassInputClass}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <DoctorDialogFieldLabel htmlFor="doctor_office" icon={MapPin}>
                Office Location
              </DoctorDialogFieldLabel>
              <Input
                id="doctor_office"
                value={form.office_location}
                onChange={(e) => onFormChange({ office_location: e.target.value })}
                className={doctorDialogGlassInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <DoctorDialogFieldLabel htmlFor="doctor_fee" icon={Hash}>
                Consultation Fee (EUR)
              </DoctorDialogFieldLabel>
              <Input
                id="doctor_fee"
                type="number"
                min={0}
                step="0.01"
                value={form.consultation_fee}
                onChange={(e) => onFormChange({ consultation_fee: e.target.value })}
                className={doctorDialogGlassInputClass}
              />
            </div>
            <div className="space-y-1.5">
              <DoctorDialogFieldLabel htmlFor="doctor_years" icon={Hash}>
                Years Of Experience
              </DoctorDialogFieldLabel>
              <Input
                id="doctor_years"
                type="number"
                min={0}
                value={form.years_of_experience}
                onChange={(e) => onFormChange({ years_of_experience: e.target.value })}
                className={doctorDialogGlassInputClass}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <DoctorDialogFieldLabel htmlFor="doctor_languages" icon={Hash}>
                Languages Spoken
              </DoctorDialogFieldLabel>
              <Input
                id="doctor_languages"
                value={form.languages_spoken}
                onChange={(e) => onFormChange({ languages_spoken: e.target.value })}
                placeholder="English, German"
                className={doctorDialogGlassInputClass}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2 rounded-xl border border-emerald-200/50 bg-emerald-50/40 px-3 py-2">
              <input
                id="doctor_is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => onFormChange({ is_active: e.target.checked })}
                className="h-4 w-4 rounded border-emerald-300 accent-emerald-600"
              />
              <label htmlFor="doctor_is_active" className="text-sm text-gray-700">
                Active — available for new appointment bookings
              </label>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-emerald-200/60 bg-emerald-50/40 px-6 py-4">
          <div className="flex flex-wrap justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost" className={doctorDialogGlassBackButtonClass}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              disabled={!canSubmit}
              className={emeraldGlassPrimaryButtonClass}
              onClick={onSubmit}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <Save className="shrink-0" aria-hidden />
              )}
              Update Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
