"use client";

import type { LucideIcon } from "lucide-react";
import { FormRequiredMark } from "@/components/shared/form/FormRequiredMark";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Step label with sky icon — matches schedule/confirm field labels. */
export function PatientBookingSectionHeading({
  id,
  icon: Icon,
  children,
  className,
}: {
  id?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      id={id}
      className={cn(
        "flex items-center gap-1.5 text-sm font-semibold tracking-tight text-gray-700",
        className
      )}
    >
      <Icon className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
      {children}
    </h3>
  );
}

/** Field label with icon above inputs (reason, notes, date). */
export function PatientBookingFieldLabel({
  htmlFor,
  icon: Icon,
  children,
  iconMuted = false,
  required = false,
}: {
  htmlFor?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  iconMuted?: boolean;
  required?: boolean;
}) {
  return (
    <Label
      htmlFor={htmlFor}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-700"
    >
      <Icon
        className={cn("h-4 w-4 shrink-0", iconMuted ? "text-muted-foreground" : "text-sky-600")}
        aria-hidden
      />
      {children}
      {required ? <FormRequiredMark /> : null}
    </Label>
  );
}
