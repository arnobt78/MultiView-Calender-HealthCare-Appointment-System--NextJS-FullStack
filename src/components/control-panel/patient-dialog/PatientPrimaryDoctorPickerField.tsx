"use client";

import { useMemo, useState } from "react";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DoctorDirectoryPickerCard } from "@/components/shared/doctor-display/DoctorDirectoryPickerCard";
import { DoctorDirectoryPickerList } from "@/components/shared/doctor-display/DoctorDirectoryPickerList";
import { StaffAppointmentPickerField } from "@/components/shared/scheduling/StaffAppointmentPickerField";
import { useDoctorsDirectory } from "@/hooks/useDoctorsDirectory";
import { prefetchDoctorsDirectory } from "@/lib/prefetch-doctors-directory";
import { clinicalCellMutedTextClass } from "@/lib/table-display-styles";
import { toTitleCaseLabel } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

const NOT_ASSIGNED_LABEL = "Not Assigned";

type Props = {
  dialogOpen: boolean;
  value: string;
  onValueChange: (doctorId: string) => void;
  disabled?: boolean;
};

/**
 * Primary doctor picker — same directory cards/list as appointment "Treating Physician"
 * (`GET /api/doctors` / `useDoctorsDirectory`), with optional "Not Assigned".
 */
export function PatientPrimaryDoctorPickerField({
  dialogOpen,
  value,
  onValueChange,
  disabled,
}: Props) {
  const queryClient = useQueryClient();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data, isLoading } = useDoctorsDirectory({ enabled: dialogOpen });

  const doctors = useMemo(() => data?.doctors ?? [], [data?.doctors]);
  const selected = value ? doctors.find((d) => d.id === value) : undefined;

  const handleOpenChange = (next: boolean) => {
    setPickerOpen(next);
    if (next) void prefetchDoctorsDirectory(queryClient);
  };

  return (
    <StaffAppointmentPickerField
      tone="emerald"
      icon={Stethoscope}
      label={toTitleCaseLabel("Select Primary Doctor (From Staff List)")}
      placeholder={toTitleCaseLabel(NOT_ASSIGNED_LABEL)}
      triggerValue={
        selected
          ? selected.display_name?.trim() || selected.email?.trim() || "Doctor"
          : toTitleCaseLabel(NOT_ASSIGNED_LABEL)
      }
      selectedContent={
        selected ? <DoctorDirectoryPickerCard doctor={selected} selected readOnly /> : undefined
      }
      changeLabel={toTitleCaseLabel("Change doctor")}
      open={pickerOpen}
      onOpenChange={handleOpenChange}
      disabled={disabled}
    >
      <div className="space-y-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 w-full justify-start rounded-xl text-muted-foreground hover:bg-emerald-50/80"
          onClick={() => {
            onValueChange("");
            setPickerOpen(false);
          }}
        >
          <span className={clinicalCellMutedTextClass}>{NOT_ASSIGNED_LABEL}</span>
        </Button>
        <DoctorDirectoryPickerList
          doctors={doctors}
          selectedDoctorId={value}
          onSelectDoctor={onValueChange}
          isLoading={isLoading}
          fillHeight={false}
          dropdownMode
          onAfterSelect={() => setPickerOpen(false)}
        />
      </div>
    </StaffAppointmentPickerField>
  );
}
