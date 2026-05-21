"use client";

import { CheckCircle2 } from "lucide-react";
import {
  PATIENT_BOOKING_STEP_LABELS,
  type PatientBookingStep,
} from "@/lib/patient-booking-wizard";

type PatientBookingStepperProps = {
  step: PatientBookingStep;
};

/** Four-step progress row — sits below dialog title, above scroll body. */
export function PatientBookingStepper({ step }: PatientBookingStepperProps) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-2 px-6 pb-4">
      {PATIENT_BOOKING_STEP_LABELS.map((label, i) => {
        const n = (i + 1) as PatientBookingStep;
        const active = n === step;
        const done = n < step;
        return (
          <div key={n} className="flex items-center gap-1">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                done
                  ? "bg-sky-600 text-white"
                  : active
                    ? "bg-sky-100 text-sky-700 ring-2 ring-sky-400"
                    : "bg-muted text-muted-foreground"
              }`}
              title={label}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
            </div>
            {i < PATIENT_BOOKING_STEP_LABELS.length - 1 && (
              <div className={`h-0.5 w-8 rounded ${done ? "bg-sky-600" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
