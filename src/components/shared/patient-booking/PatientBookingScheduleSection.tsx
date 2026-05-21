"use client";

import { addMinutes, format } from "date-fns";
import { CalendarDays, CalendarX, Clock, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { PatientBookingAppointmentType } from "@/lib/patient-booking-wizard";
import type { User as AppUser } from "@/types/types";
import {
  patientBookingGlassInputClass,
} from "@/components/shared/patient-booking/patient-booking-dialog-styles";

type PatientBookingScheduleSectionProps = {
  today: string;
  dateStr: string;
  onDateStrChange: (value: string) => void;
  selectedDoctor: AppUser | undefined;
  selectedType: PatientBookingAppointmentType | null;
  isFlexible: boolean;
  flexDuration: number;
  duration: number;
  slotsLoading: boolean;
  slots: string[];
  selectedSlot: string | null;
  onSelectSlot: (iso: string) => void;
};

/**
 * Step 2+ body — date picker with inline availability grid (no separate "See Slots" page).
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
  slotsLoading,
  slots,
  selectedSlot,
  onSelectSlot,
}: PatientBookingScheduleSectionProps) {
  const showSlots = Boolean(dateStr && !isFlexible && selectedType);

  return (
    <section className="space-y-4 border-t border-sky-100/80 pt-6" aria-labelledby="pb-schedule-heading">
      <h3 id="pb-schedule-heading" className="text-sm font-semibold tracking-tight text-gray-700">
        Date & time
      </h3>

      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-sky-600" />
          Pick a Date
        </Label>
        <Input
          type="date"
          value={dateStr}
          min={today}
          onChange={(e) => onDateStrChange(e.target.value)}
          className={cn(patientBookingGlassInputClass, "cursor-pointer text-sm")}
        />
        {selectedDoctor ? (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Stethoscope className="h-3 w-3 shrink-0" />
            Dr. {selectedDoctor.display_name ?? selectedDoctor.email}
            {selectedType && ` · ${selectedType.name} · ${selectedType.duration_minutes} min`}
            {isFlexible && ` · ${flexDuration} min`}
          </p>
        ) : null}
      </div>

      {showSlots ? (
        <div className="space-y-2">
          <Label className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-sky-600" />
            Available Slots
            {dateStr
              ? ` — ${format(new Date(`${dateStr}T12:00:00`), "EEE, dd MMM yyyy")}`
              : ""}
          </Label>
          {slotsLoading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-xl" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sky-200/80 p-6 text-center">
              <CalendarX className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-medium">No slots available</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try a different date or doctor.
              </p>
            </div>
          ) : (
            <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
              {slots.map((slot) => {
                const slotTime = format(new Date(slot), "HH:mm");
                const endTime = format(addMinutes(new Date(slot), duration), "HH:mm");
                const selected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onSelectSlot(slot)}
                    className={cn(
                      "rounded-xl border px-2 py-2 text-sm font-medium transition-all",
                      selected
                        ? "border-sky-500 bg-sky-600 text-white shadow-[0_8px_20px_rgba(2,132,199,0.35)]"
                        : "border-sky-200/80 bg-white/90 text-sky-900 hover:border-sky-400 hover:bg-sky-50"
                    )}
                  >
                    <span className="block">{slotTime}</span>
                    <span className="block text-[10px] opacity-80">→ {endTime}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
