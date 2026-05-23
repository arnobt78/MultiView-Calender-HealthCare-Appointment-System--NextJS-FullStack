"use client";

import { CalendarDays } from "lucide-react";
import { PatientBookingDoctorVisitSummary } from "@/components/shared/patient-booking/PatientBookingDoctorVisitSummary";
import { SchedulingPanel } from "@/components/shared/scheduling/SchedulingPanel";
import { cn } from "@/lib/utils";
import type { FlexDurationMinutes } from "@/lib/scheduling/flexible-type-config";
import type { PatientBookingAppointmentType } from "@/lib/patient-booking-wizard";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";

type PatientBookingScheduleSectionProps = {
  today: string;
  dateStr: string;
  onDateStrChange: (value: string) => void;
  selectedDoctor: DoctorDirectoryRow | undefined;
  selectedType: PatientBookingAppointmentType | null;
  isFlexible: boolean;
  flexDuration: number;
  duration: number;
  selectedSlot: string | null;
  onSelectSlot: (iso: string) => void;
  fillLayout?: boolean;
};

/**
 * Step 2 — shared SchedulingPanel (split calendar + slot rail on sm+).
 */
export function PatientBookingScheduleSection({
  today,
  dateStr,
  onDateStrChange,
  selectedDoctor,
  selectedType,
  isFlexible,
  flexDuration,
  duration,
  selectedSlot,
  onSelectSlot,
  fillLayout = false,
}: PatientBookingScheduleSectionProps) {
  const doctorId = selectedDoctor?.id ?? "";
  const typeId = selectedType?.id ?? "";

  return (
    <section
      className={cn(
        "flex flex-col gap-4",
        fillLayout && "min-h-0 flex-1",
        !fillLayout && "border-t border-sky-100/80 pt-4"
      )}
      aria-labelledby="pb-schedule-heading"
    >
      {selectedDoctor ? (
        <PatientBookingDoctorVisitSummary
          layout="schedule"
          doctor={selectedDoctor}
          selectedType={selectedType}
          isFlexible={isFlexible}
          flexDuration={flexDuration}
          dateStr={dateStr}
          selectedSlot={selectedSlot}
          duration={duration}
        />
      ) : null}

      <h3
        id="pb-schedule-heading"
        className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-gray-700"
      >
        <CalendarDays className="h-4 w-4 text-sky-600" />
        Select Available Date & Time
      </h3>

      {doctorId ? (
        <div className={cn(fillLayout && "flex min-h-0 min-w-0 flex-1 flex-col")}>
          <SchedulingPanel
            doctorId={doctorId}
            typeId={typeId}
            typeDuration={duration}
            dateStr={dateStr}
            onDateStrChange={onDateStrChange}
            selectedSlot={selectedSlot}
            onSelectSlot={onSelectSlot}
            today={today}
            isFlexible={isFlexible}
            flexDurationMinutes={flexDuration as FlexDurationMinutes}
            layout="split"
            fillLayout={fillLayout}
            className="min-w-0"
          />
        </div>
      ) : null}
    </section>
  );
}
