"use client";

import { addMinutes, format } from "date-fns";
import { CalendarDays, Clock, FileText, Stethoscope, Timer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { PatientBookingAppointmentType } from "@/lib/patient-booking-wizard";
import type { User as AppUser } from "@/types/types";
import {
  patientBookingGlassInputClass,
  patientBookingSummaryCardClass,
} from "@/components/shared/patient-booking/patient-booking-dialog-styles";

type PatientBookingConfirmSectionProps = {
  selectedDoctor: AppUser | undefined;
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

/** Step 4 — summary glass card, reason, notes, flexible start time. */
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
    <section
      className="space-y-4 border-t border-sky-100/80 pt-6"
      aria-labelledby="pb-confirm-heading"
    >
      <h3 id="pb-confirm-heading" className="text-sm font-semibold tracking-tight text-gray-700">
        Confirm your request
      </h3>

      <div className={patientBookingSummaryCardClass}>
        {selectedDoctor ? (
          <div className="flex items-center gap-2 text-sky-800">
            <Stethoscope className="h-3.5 w-3.5 shrink-0" />
            <span>Dr. {selectedDoctor.display_name ?? selectedDoctor.email}</span>
          </div>
        ) : null}
        <div className="flex items-center gap-2 text-sky-800">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>
            {dateStr ? format(new Date(`${dateStr}T12:00:00`), "EEEE, dd MMM yyyy") : "—"}
            {(selectedSlot || isFlexible) && " · "}
            {selectedSlot ? format(new Date(selectedSlot), "HH:mm") : null}
            {selectedSlot
              ? ` → ${format(addMinutes(new Date(selectedSlot), duration), "HH:mm")}`
              : null}
            {isFlexible && !selectedSlot ? ` · ${flexDuration} min` : null}
          </span>
        </div>
        {selectedType ? (
          <div className="flex items-center gap-2 text-sky-800">
            <Timer className="h-3.5 w-3.5 shrink-0" />
            <span>
              {selectedType.name} · {selectedType.duration_minutes} min
            </span>
          </div>
        ) : null}
      </div>

      {isFlexible ? (
        <div className="space-y-1.5">
          <Label htmlFor="pb-flex-time" className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-sky-600" />
            Preferred Start Time
          </Label>
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

      <div className="space-y-1.5">
        <Label htmlFor="pb-title" className="flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-sky-600" />
          Reason for Visit
        </Label>
        <Input
          id="pb-title"
          placeholder="Reason for visit"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
          className={cn(patientBookingGlassInputClass, "cursor-text")}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pb-notes" className="flex items-center gap-1.5">
          <FileText className="h-4 w-4 text-muted-foreground" />
          Additional Notes
        </Label>
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
