"use client";

import { useRef, useState } from "react";
import { CalendarDays, FileUp, Info, Stethoscope, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PatientDialogFieldLabel } from "@/components/control-panel/patient-dialog/PatientDialogFieldLabel";
import { DoctorDirectoryPickerList } from "@/components/shared/doctor-display/DoctorDirectoryPickerList";
import { StaffAppointmentPickerField } from "@/components/shared/scheduling/StaffAppointmentPickerField";
import { DoctorDirectoryPickerCard } from "@/components/shared/doctor-display/DoctorDirectoryPickerCard";
import { useDoctorsDirectory } from "@/hooks/useDoctorsDirectory";
import { prefetchDoctorsDirectory } from "@/lib/prefetch-doctors-directory";
import { emeraldGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import {
  googleCalendarAdvancedImportDialogShellClass,
  googleCalendarAdvancedImportInfoNoteClass,
  googleCalendarIcsCopy,
} from "@/lib/google-calendar-ui-classes";
import { patientDialogGlassBackButtonClass } from "@/lib/patient-dialog-ui-classes";
import { cn, toTitleCaseLabel } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isImporting: boolean;
  /** Resolve when import succeeds — dialog closes only after this settles. */
  onImport: (file: File, treatingPhysicianId: string) => void | Promise<void>;
};

/** Resets picker + file when dialog closes — avoids stale doctor on reopen. */
function resetAdvancedImportForm(
  fileInputRef: React.RefObject<HTMLInputElement | null>,
  setDoctorId: (id: string) => void,
  setSelectedFile: (file: File | null) => void,
  setPickerOpen: (open: boolean) => void
) {
  setDoctorId("");
  setSelectedFile(null);
  setPickerOpen(false);
  if (fileInputRef.current) fileInputRef.current.value = "";
}

/** 90vw advanced ICS import — patient/appointment dialog shell + treating physician assignment. */
export function GoogleCalendarAdvancedImportDialog({
  open,
  onOpenChange,
  isImporting,
  onImport,
}: Props) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [doctorId, setDoctorId] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { data, isLoading } = useDoctorsDirectory({ enabled: open });

  const doctors = data?.doctors ?? [];
  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  const handlePickerOpen = (next: boolean) => {
    setPickerOpen(next);
    if (next) void prefetchDoctorsDirectory(queryClient);
  };

  const canSubmit = Boolean(selectedFile && doctorId && !isImporting);

  function handleOpenChange(next: boolean) {
    if (!next && isImporting) return;
    if (!next) {
      resetAdvancedImportForm(fileInputRef, setDoctorId, setSelectedFile, setPickerOpen);
    }
    onOpenChange(next);
  }

  async function handleSubmit() {
    if (!selectedFile || !doctorId || isImporting) return;
    try {
      await onImport(selectedFile, doctorId);
      resetAdvancedImportForm(fileInputRef, setDoctorId, setSelectedFile, setPickerOpen);
      onOpenChange(false);
    } catch {
      // Hook onError toast — keep dialog open with doctor + file for retry.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={googleCalendarAdvancedImportDialogShellClass}
      >
        <div className="shrink-0 bg-white pt-6 text-gray-700">
          <div className="px-6">
            <div className="flex items-start gap-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/70 bg-emerald-50 text-emerald-700">
                <FileUp className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <DialogTitle className="text-left text-lg font-semibold text-gray-700">
                  {toTitleCaseLabel(googleCalendarIcsCopy.advancedImportTitle)}
                </DialogTitle>
                <DialogDescription className="text-left text-sm text-muted-foreground">
                  {googleCalendarIcsCopy.advancedImportDialogDescription}
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
          <div className="flex flex-col gap-4">
            <div className={googleCalendarAdvancedImportInfoNoteClass}>
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden />
                <p className="leading-relaxed">{googleCalendarIcsCopy.advancedImportInfoNote}</p>
              </div>
            </div>

            <div className="space-y-2">
              <PatientDialogFieldLabel icon={Stethoscope} required>
                {toTitleCaseLabel("Treating physician")}
              </PatientDialogFieldLabel>
              <StaffAppointmentPickerField
                tone="emerald"
                icon={Stethoscope}
                label={null}
                placeholder={toTitleCaseLabel("Select treating physician")}
                triggerValue={
                  selectedDoctor
                    ? selectedDoctor.display_name?.trim() || selectedDoctor.email || "Doctor"
                    : toTitleCaseLabel("Select treating physician")
                }
                selectedContent={
                  selectedDoctor ? (
                    <DoctorDirectoryPickerCard doctor={selectedDoctor} selected readOnly />
                  ) : undefined
                }
                changeLabel={toTitleCaseLabel("Change doctor")}
                open={pickerOpen}
                onOpenChange={handlePickerOpen}
              >
                <DoctorDirectoryPickerList
                  doctors={doctors}
                  selectedDoctorId={doctorId}
                  isLoading={isLoading}
                  dropdownMode
                  onSelectDoctor={(id) => {
                    setDoctorId(id);
                    setPickerOpen(false);
                  }}
                />
              </StaffAppointmentPickerField>
            </div>

            <div className="space-y-2">
              <PatientDialogFieldLabel
                htmlFor="gcal-advanced-ics-file"
                icon={CalendarDays}
                required
              >
                {googleCalendarIcsCopy.advancedImportCalendarFileLabel}
              </PatientDialogFieldLabel>
              <input
                ref={fileInputRef}
                id="gcal-advanced-ics-file"
                type="file"
                accept=".ics"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  patientDialogGlassBackButtonClass,
                  "h-11 w-full justify-center rounded-2xl"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4 shrink-0" aria-hidden />
                <span className="truncate">
                  {selectedFile ? selectedFile.name : googleCalendarIcsCopy.chooseFileButton}
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-emerald-200/60 bg-emerald-50/40 px-6 py-3">
          <Button
            type="button"
            variant="ghost"
            className={cn(patientDialogGlassBackButtonClass, "rounded-full")}
            onClick={() => handleOpenChange(false)}
            disabled={isImporting}
          >
            <X className="size-4 shrink-0" aria-hidden />
            {toTitleCaseLabel("Cancel")}
          </Button>
          <Button
            type="button"
            className={cn(emeraldGlassPrimaryButtonClass, "rounded-full")}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            <Upload className="size-4 shrink-0" aria-hidden />
            {isImporting ? "Importing…" : toTitleCaseLabel("Import appointments")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
