"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  staffAppointmentDropdownPanelClass,
  staffAppointmentGlassSelectChevronClass,
  staffAppointmentGlassSelectPlaceholderClass,
  staffAppointmentGlassSelectTriggerClass,
  staffAppointmentGlassSelectValueClass,
} from "@/lib/appointment-dialog-ui-classes";
import {
  patientDialogDropdownPanelClass,
  patientDialogGlassSelectChevronClass,
  patientDialogGlassSelectPlaceholderClass,
  patientDialogGlassSelectTriggerClass,
  patientDialogGlassSelectValueClass,
} from "@/lib/patient-dialog-ui-classes";
import {
  invoiceDialogDropdownPanelClass,
  invoiceDialogGlassSelectChevronClass,
  invoiceDialogGlassSelectPlaceholderClass,
  invoiceDialogGlassSelectTriggerClass,
  invoiceDialogGlassSelectValueClass,
} from "@/lib/invoice-dialog-ui-classes";
import { bookingPickerCollapsedInsetClass } from "@/components/shared/patient-booking/patient-booking-dialog-styles";
import { useDismissOnPointerDownOutside } from "@/hooks/useDismissOnPointerDownOutside";
import { cn } from "@/lib/utils";

type StaffAppointmentPickerFieldProps = {
  icon: LucideIcon;
  label: ReactNode;
  placeholder: string;
  /** Compact label on the h-11 trigger while the list is open (matches Select value row). */
  triggerValue?: ReactNode;
  /** Patient booking collapsed card — below trigger when closed and selected. */
  selectedContent?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changeLabel: string;
  children: ReactNode;
  disabled?: boolean;
  /** `sky` = appointment dialog; `emerald` = patient; `amber` = invoice dialog. */
  tone?: "sky" | "emerald" | "amber";
  className?: string;
};

/**
 * Staff dialog custom picker — `staffAppointmentGlassSelectTriggerClass` matches Client/Category/Status Select;
 * list panel opens below trigger; pointer-down outside + Escape dismiss (same as Radix Select).
 */
export function StaffAppointmentPickerField({
  icon: Icon,
  label,
  placeholder,
  triggerValue,
  selectedContent,
  open,
  onOpenChange,
  changeLabel,
  children,
  disabled = false,
  tone = "sky",
  className,
}: StaffAppointmentPickerFieldProps) {
  const isEmerald = tone === "emerald";
  const isAmber = tone === "amber";
  const triggerClass = isAmber
    ? invoiceDialogGlassSelectTriggerClass
    : isEmerald
      ? patientDialogGlassSelectTriggerClass
      : staffAppointmentGlassSelectTriggerClass;
  const panelClass = isAmber
    ? invoiceDialogDropdownPanelClass
    : isEmerald
      ? patientDialogDropdownPanelClass
      : staffAppointmentDropdownPanelClass;
  const chevronClass = isAmber
    ? invoiceDialogGlassSelectChevronClass
    : isEmerald
      ? patientDialogGlassSelectChevronClass
      : staffAppointmentGlassSelectChevronClass;
  const placeholderClass = isAmber
    ? invoiceDialogGlassSelectPlaceholderClass
    : isEmerald
      ? patientDialogGlassSelectPlaceholderClass
      : staffAppointmentGlassSelectPlaceholderClass;
  const valueClass = isAmber
    ? invoiceDialogGlassSelectValueClass
    : isEmerald
      ? patientDialogGlassSelectValueClass
      : staffAppointmentGlassSelectValueClass;
  const labelIconClass = isAmber
    ? "text-amber-600"
    : isEmerald
      ? "text-emerald-600"
      : "text-sky-600";
  const openRingClass = isAmber
    ? "border-amber-400/50 ring-2 ring-amber-200/40"
    : isEmerald
      ? "border-emerald-400/50 ring-2 ring-emerald-200/40"
      : "border-sky-400/50 ring-2 ring-sky-200/40";
  const changeBtnClass = isAmber
    ? "text-amber-800 hover:bg-amber-50 hover:text-amber-950"
    : isEmerald
      ? "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900"
      : "text-sky-700 hover:bg-sky-50 hover:text-sky-900";

  const rootRef = useRef<HTMLDivElement>(null);
  const hasSelection = selectedContent != null && selectedContent !== false;
  const showTrigger = !hasSelection || open;
  const showSelectedSummary = hasSelection && !open;

  useDismissOnPointerDownOutside(rootRef, open && !disabled, () => onOpenChange(false));

  const triggerLabel =
    open && triggerValue != null
      ? triggerValue
      : !hasSelection
        ? placeholder
        : triggerValue ?? placeholder;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5 text-gray-700">
        <Icon className={cn("h-3.5 w-3.5 shrink-0", labelIconClass)} aria-hidden />
        <Label className="text-gray-700">{label}</Label>
      </div>

      <div ref={rootRef} className="space-y-2">
        {showTrigger ? (
          <button
            type="button"
            disabled={disabled}
            aria-expanded={open}
            aria-haspopup="listbox"
            className={cn(triggerClass, open && openRingClass)}
            onClick={() => onOpenChange(!open)}
          >
            <span
              className={cn(valueClass, !hasSelection && !open && placeholderClass)}
            >
              {triggerLabel}
            </span>
            <ChevronDownIcon
              className={cn(chevronClass, "transition-transform", open && "rotate-180")}
              aria-hidden
            />
          </button>
        ) : null}

        {open ? (
          <div className={panelClass} role="presentation">
            {children}
          </div>
        ) : null}

        {showSelectedSummary ? (
          <div className={panelClass}>
            <div className={bookingPickerCollapsedInsetClass}>
              {selectedContent}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn("h-8 w-full cursor-pointer", changeBtnClass)}
                onClick={() => onOpenChange(true)}
                disabled={disabled}
              >
                <ChevronDownIcon
                  className={cn(chevronClass, "mr-1 rotate-180")}
                  aria-hidden
                />
                {changeLabel}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
