"use client";

import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  doctorSettingsFieldLabelClass,
  doctorSettingsRequiredMarkClass,
} from "@/lib/doctor-settings-field-label";
import { cn, toTitleCaseLabel } from "@/lib/utils";

type DoctorSettingsFieldLabelProps = {
  htmlFor?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  children: string;
  required?: boolean;
  className?: string;
};

export function DoctorSettingsFieldLabel({
  htmlFor,
  icon: Icon,
  iconClassName,
  children,
  required = false,
  className,
}: DoctorSettingsFieldLabelProps) {
  return (
    <Label htmlFor={htmlFor} className={cn(doctorSettingsFieldLabelClass, className)}>
      {Icon ? (
        <Icon className={cn("h-3.5 w-3.5 shrink-0", iconClassName)} aria-hidden />
      ) : null}
      {toTitleCaseLabel(children)}
      {required ? (
        <span className={doctorSettingsRequiredMarkClass} aria-hidden>
          {" "}
          *
        </span>
      ) : null}
    </Label>
  );
}
