"use client";

import { useRef, useState } from "react";
import { Stethoscope, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { DoctorDirectoryPickerList } from "@/components/shared/doctor-display/DoctorDirectoryPickerList";
import { StaffAppointmentPickerField } from "@/components/shared/scheduling/StaffAppointmentPickerField";
import { DoctorDirectoryPickerCard } from "@/components/shared/doctor-display/DoctorDirectoryPickerCard";
import { useDoctorsDirectory } from "@/hooks/useDoctorsDirectory";
import { prefetchDoctorsDirectory } from "@/lib/prefetch-doctors-directory";
import {
  googleCalendarAdvancedImportDialogShellClass,
  googleCalendarIcsCopy,
  googleCalendarMandatoryLabelClass,
} from "@/lib/google-calendar-ui-classes";
import { cn, toTitleCaseLabel } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isImporting: boolean;
  onImport: (file: File, treatingPhysicianId: string) => void;
};

/** 90vw advanced ICS import — assign treating physician via staff directory picker. */
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

  function handleSubmit() {
    if (!selectedFile || !doctorId) return;
    onImport(selectedFile, doctorId);
    setSelectedFile(null);
    setDoctorId("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={googleCalendarAdvancedImportDialogShellClass}>
        <DialogHeader className="border-b border-emerald-100/80 px-6 py-4">
          <DialogTitle className="text-lg font-semibold text-gray-700">
            {toTitleCaseLabel(googleCalendarIcsCopy.advancedImportTitle)}
          </DialogTitle>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
          <div className="space-y-2">
            <Label className={googleCalendarMandatoryLabelClass}>
              {toTitleCaseLabel("Treating physician")}
            </Label>
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
            <Label htmlFor="gcal-advanced-ics-file" className={googleCalendarMandatoryLabelClass}>
              {toTitleCaseLabel("Calendar file")}
            </Label>
            <input
              ref={fileInputRef}
              id="gcal-advanced-ics-file"
              type="file"
              accept=".ics"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            <ControlPanelGlassActionButton
              variant="emerald"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" aria-hidden />
              {selectedFile ? selectedFile.name : googleCalendarIcsCopy.chooseFileButton}
            </ControlPanelGlassActionButton>
          </div>
        </div>
        <DialogFooter className="gap-2 border-t border-emerald-100/80 px-6 py-4 sm:justify-end">
          <ControlPanelGlassActionButton
            variant="sky"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </ControlPanelGlassActionButton>
          <ControlPanelGlassActionButton
            variant="emerald"
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            <Upload className="h-4 w-4" aria-hidden />
            {isImporting ? "Importing…" : toTitleCaseLabel("Import appointments")}
          </ControlPanelGlassActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
