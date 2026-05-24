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
  className,
}: StaffAppointmentPickerFieldProps) {
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
        <Icon className="h-3.5 w-3.5 shrink-0 text-sky-600" aria-hidden />
        <Label className="text-gray-700">{label}</Label>
      </div>

      <div ref={rootRef} className="space-y-2">
        {showTrigger ? (
          <button
            type="button"
            disabled={disabled}
            aria-expanded={open}
            aria-haspopup="listbox"
            className={cn(
              staffAppointmentGlassSelectTriggerClass,
              open && "border-sky-400/50 ring-2 ring-sky-200/40"
            )}
            onClick={() => onOpenChange(!open)}
          >
            <span
              className={cn(
                staffAppointmentGlassSelectValueClass,
                !hasSelection && !open && staffAppointmentGlassSelectPlaceholderClass
              )}
            >
              {triggerLabel}
            </span>
            <ChevronDownIcon
              className={cn(
                staffAppointmentGlassSelectChevronClass,
                "transition-transform",
                open && "rotate-180"
              )}
              aria-hidden
            />
          </button>
        ) : null}

        {open ? (
          <div className={staffAppointmentDropdownPanelClass} role="presentation">
            {children}
          </div>
        ) : null}

        {showSelectedSummary ? (
          <div className={staffAppointmentDropdownPanelClass}>
            <div className={bookingPickerCollapsedInsetClass}>
              {selectedContent}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-full cursor-pointer text-sky-700 hover:bg-sky-50 hover:text-sky-900"
                onClick={() => onOpenChange(true)}
                disabled={disabled}
              >
                <ChevronDownIcon
                  className={cn(staffAppointmentGlassSelectChevronClass, "mr-1 rotate-180")}
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
