"use client";

import { Book, Stethoscope, Timer } from "lucide-react";
import { Label } from "@/components/ui/label";
import { DoctorDirectoryPickerCard } from "@/components/shared/doctor-display/DoctorDirectoryPickerCard";
import { DoctorDirectoryPickerList } from "@/components/shared/doctor-display/DoctorDirectoryPickerList";
import { PatientBookingTypePickerList } from "@/components/shared/patient-booking/PatientBookingTypePickerList";
import { cn } from "@/lib/utils";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import type { PatientBookingAppointmentType } from "@/lib/patient-booking-wizard";

type PatientBookingDoctorTypeSectionProps = {
  lockDoctor: boolean;
  doctors: DoctorDirectoryRow[];
  doctorsLoading: boolean;
  selectedDoctor: DoctorDirectoryRow | undefined;
  doctorId: string;
  onDoctorIdChange: (id: string) => void;
  typesLoading: boolean;
  isFlexible: boolean;
  types: PatientBookingAppointmentType[];
  selectedType: PatientBookingAppointmentType | null;
  onSelectType: (type: PatientBookingAppointmentType) => void;
  flexDuration: number;
  onFlexDurationChange: (minutes: number) => void;
  /** Step 1 only — split panels flex-fill to footer; each panel scrolls internally. */
  fillLayout?: boolean;
  inactiveTypes?: PatientBookingAppointmentType[];
};

/** Step 1 — directory cards (availabilities + service labels) or locked card; visit type below. */
export function PatientBookingDoctorTypeSection({
  lockDoctor,
  doctors,
  doctorsLoading,
  selectedDoctor,
  doctorId,
  onDoctorIdChange,
  typesLoading,
  isFlexible,
  types,
  selectedType,
  onSelectType,
  flexDuration,
  onFlexDurationChange,
  fillLayout = false,
  inactiveTypes = [],
}: PatientBookingDoctorTypeSectionProps) {
  const doctorPanel = (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        fillLayout && !doctorId && "min-h-0 flex-1",
        fillLayout && doctorId && "shrink-0"
      )}
    >
      <Label className="flex shrink-0 items-center gap-1.5">
        <Stethoscope className="h-4 w-4 text-sky-600" />
        Select Preferred Doctor
      </Label>
      <div className={cn(fillLayout && "flex min-h-0 flex-1 flex-col")}>
        {lockDoctor && selectedDoctor ? (
          <DoctorDirectoryPickerCard doctor={selectedDoctor} selected readOnly />
        ) : (
          <DoctorDirectoryPickerList
            doctors={doctors}
            selectedDoctorId={doctorId}
            onSelectDoctor={onDoctorIdChange}
            isLoading={doctorsLoading}
            fillHeight={fillLayout && !doctorId}
          />
        )}
      </div>
    </div>
  );

  const typePanel = doctorId ? (
    <div
      className={cn(
        "flex flex-col gap-2",
        fillLayout && "min-h-0 flex-1"
      )}
    >
      <Label className="flex shrink-0 items-center gap-1.5">
        <Timer className="h-4 w-4 text-sky-600" />
        Select Appointment Type
      </Label>
      <PatientBookingTypePickerList
        key={doctorId}
        typesLoading={typesLoading}
        isFlexible={isFlexible}
        types={types}
        selectedType={selectedType}
        onSelectType={onSelectType}
        flexDuration={flexDuration}
        onFlexDurationChange={onFlexDurationChange}
        fillLayout={fillLayout}
        doctorConsultationFeeCents={selectedDoctor?.consultation_fee}
        inactiveTypes={inactiveTypes}
      />
    </div>
  ) : null;

  return (
    <section
      className={cn("flex flex-col gap-3", fillLayout && "min-h-0 flex-1")}
      aria-labelledby="pb-doctor-type-heading"
    >
      <h3
        id="pb-doctor-type-heading"
        className="flex shrink-0 items-center gap-1.5 text-sm font-semibold tracking-tight text-gray-700"
      >
        <Book className="h-4 w-4 text-sky-600" />
        Select Preferred Doctor & Visit Type
      </h3>

      <div className={cn("flex flex-col gap-3", fillLayout && "min-h-0 flex-1")}>
        {doctorPanel}
        {typePanel}
      </div>
    </section>
  );
}
