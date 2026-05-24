"use client";

import { CalendarCheck, Clock, MessageSquareText, NotebookPen } from "lucide-react";
import { PatientBookingDoctorVisitSummary } from "@/components/shared/patient-booking/PatientBookingDoctorVisitSummary";
import {
  PatientBookingFieldLabel,
  PatientBookingSectionHeading,
} from "@/components/shared/patient-booking/patient-booking-section-heading";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { PatientBookingAppointmentType } from "@/lib/patient-booking-wizard";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import { patientBookingGlassInputClass } from "@/components/shared/patient-booking/patient-booking-dialog-styles";

type PatientBookingConfirmSectionProps = {
  selectedDoctor: DoctorDirectoryRow | undefined;
  dateStr: string;
  selectedSlot: string | null;
  isFlexible: boolean;
  flexDuration: number;
  duration: number;
  selectedType: PatientBookingAppointmentType | null;
  title: string;
  onTitleChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  onFlexibleTimeChange: (isoSlot: string) => void;
};

/** Step 3 — summary glass card; reason defaults from visit type via `seedReasonForVisitOnStep3` in dialog. */
export function PatientBookingConfirmSection({
  selectedDoctor,
  dateStr,
  selectedSlot,
  isFlexible,
  flexDuration,
  duration,
  selectedType,
  title,
  onTitleChange,
  notes,
  onNotesChange,
  onFlexibleTimeChange,
}: PatientBookingConfirmSectionProps) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby="pb-confirm-heading">
      <PatientBookingSectionHeading id="pb-confirm-heading" icon={CalendarCheck}>
        Confirm Your Request
      </PatientBookingSectionHeading>

      {selectedDoctor ? (
        <PatientBookingDoctorVisitSummary
          layout="confirm"
          doctor={selectedDoctor}
          selectedType={selectedType}
          isFlexible={isFlexible}
          flexDuration={flexDuration}
          dateStr={dateStr}
          selectedSlot={selectedSlot}
          duration={duration}
        />
      ) : null}

      {isFlexible ? (
        <div className="flex flex-col gap-1.5">
          <PatientBookingFieldLabel htmlFor="pb-flex-time" icon={Clock}>
            Select Preferred Start Time
          </PatientBookingFieldLabel>
          <Input
            id="pb-flex-time"
            type="time"
            required
            className={cn(patientBookingGlassInputClass, "cursor-pointer")}
            onChange={(e) => {
              if (dateStr && e.target.value) {
                onFlexibleTimeChange(`${dateStr}T${e.target.value}:00`);
              }
            }}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <PatientBookingFieldLabel htmlFor="pb-title" icon={MessageSquareText}>
          Type Your Reason for Visit
        </PatientBookingFieldLabel>
        <Input
          id="pb-title"
          placeholder="Reason for visit"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          className={cn(patientBookingGlassInputClass, "cursor-text")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <PatientBookingFieldLabel htmlFor="pb-notes" icon={NotebookPen}>
          Type Additional Notes for Your Visit
        </PatientBookingFieldLabel>
        <Textarea
          id="pb-notes"
          placeholder="Symptoms, medications, special requests…"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          className={cn(patientBookingGlassInputClass, "cursor-text min-h-[88px]")}
        />
      </div>
    </section>
  );
}
