"use client";

import { CalendarPlus, X } from "lucide-react";
import {
  DialogClose,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PatientBookingStepper } from "@/components/shared/patient-booking/PatientBookingStepper";
import type { PatientBookingStep } from "@/lib/patient-booking-wizard";

type PatientBookingDialogHeaderProps = {
  step: PatientBookingStep;
};

/**
 * Responsive 3-zone header: title + description (left), step circles (center), close (right).
 */
export function PatientBookingDialogHeader({ step }: PatientBookingDialogHeaderProps) {
  return (
    <div className="relative shrink-0 border-b border-sky-200/60 bg-white px-4 pb-3 pt-4 text-gray-700 sm:px-6 sm:pb-4 sm:pt-5">
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_2.5rem] sm:gap-x-4">
        <div className="flex min-w-0 items-start gap-2 sm:col-start-1 sm:row-start-1 sm:pr-0 pr-10">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 text-sky-700">
            <CalendarPlus className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <DialogTitle className="text-left text-lg font-semibold text-gray-700 sm:text-lg">
              Request New Appointment
            </DialogTitle>
            <DialogDescription className="text-left text-xs text-muted-foreground sm:text-sm">
              Choose your doctor, visit type, date, time, and confirm your request.
            </DialogDescription>
          </div>
        </div>

        <div className="flex justify-center sm:col-start-2 sm:row-start-1">
          <PatientBookingStepper step={step} variant="header" />
        </div>

        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-sky-100 hover:text-sky-800 sm:static sm:col-start-3 sm:row-start-1 sm:justify-self-end"
          >
            <X className="h-4 w-4" aria-hidden />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
      </div>
    </div>
  );
}
