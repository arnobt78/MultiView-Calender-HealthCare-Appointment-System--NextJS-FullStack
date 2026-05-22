"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PATIENT_BOOKING_STEP_LABELS,
  type PatientBookingStep,
} from "@/lib/patient-booking-wizard";

type PatientBookingStepperProps = {
  step: PatientBookingStep;
  /** `header` — inline in dialog title row; `bar` — legacy full-width row below title */
  variant?: "header" | "bar";
  className?: string;
};

/** Four-step progress — header (center) or legacy bar under title. */
export function PatientBookingStepper({
  step,
  variant = "bar",
  className,
}: PatientBookingStepperProps) {
  const steps = (
    <>
      {PATIENT_BOOKING_STEP_LABELS.map((label, i) => {
        const n = (i + 1) as PatientBookingStep;
        const active = n === step;
        const done = n < step;
        const connectorClass =
          variant === "header"
            ? `h-0.5 w-4 sm:w-6 rounded ${done ? "bg-sky-600" : "bg-muted"}`
            : `h-0.5 w-8 rounded ${done ? "bg-sky-600" : "bg-muted"}`;
        return (
          <div key={n} className="flex items-center gap-1">
            <div
              className={cn(
                "flex items-center justify-center rounded-full text-xs font-semibold transition-all",
                variant === "header" ? "h-7 w-7" : "h-7 w-7",
                done
                  ? "bg-sky-600 text-white"
                  : active
                    ? "bg-sky-100 text-sky-700 ring-2 ring-sky-400"
                    : "bg-muted text-muted-foreground"
              )}
              title={label}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
            </div>
            {i < PATIENT_BOOKING_STEP_LABELS.length - 1 && <div className={connectorClass} />}
          </div>
        );
      })}
    </>
  );

  if (variant === "header") {
    return (
      <div className={cn("flex items-center justify-center gap-1 sm:gap-1.5", className)}>
        {steps}
      </div>
    );
  }

  return (
    <div
      className={cn("flex shrink-0 items-center justify-center gap-2 px-6 pb-4", className)}
    >
      {steps}
    </div>
  );
}
