"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorDirectoryPickerCard } from "@/components/shared/doctor-display/DoctorDirectoryPickerCard";
import { ScrollOverflowPanel } from "@/components/shared/ScrollOverflowPanel";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import {
  bookingPickerCollapsedInsetClass,
  bookingPickerScrollClass,
  patientBookingFillScrollPanelClass,
} from "@/components/shared/patient-booking/patient-booking-dialog-styles";
import { cn } from "@/lib/utils";

/** Fixed cap — same scroll rhythm as patient booking step 1. */
export const doctorDirectoryPickerScrollClass = bookingPickerScrollClass;

/** Grows with dialog body down to footer — parent chain: dialog form → `fillStepLayout` motion → section → this node. */
export const doctorDirectoryPickerFillScrollClass = patientBookingFillScrollPanelClass;

type DoctorDirectoryPickerListProps = {
  doctors: DoctorDirectoryRow[];
  selectedDoctorId: string;
  onSelectDoctor: (doctorId: string) => void;
  isLoading?: boolean;
  /** Use dialog flex height instead of `max-h-[42vh]`. */
  fillHeight?: boolean;
  /** Override scroll region classes (staff dialog uses flush inset). */
  scrollClassName?: string;
  /** @deprecated Staff dialog — use default `bookingPickerCollapsedInsetClass` (same as patient). */
  flushInset?: boolean;
  /** Staff dropdown field — list only while open; trigger shows selection (no inline collapsed card). */
  dropdownMode?: boolean;
  onAfterSelect?: () => void;
  className?: string;
};

/**
 * Full-width doctor cards; collapses to selected card after pick (dropdown-style).
 * `pickerOpen` resets implicitly when `selectedDoctorId` is cleared (dialog reset).
 */
export function DoctorDirectoryPickerList({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  isLoading = false,
  fillHeight = false,
  scrollClassName,
  flushInset: _flushInset = false,
  dropdownMode = false,
  onAfterSelect,
  className,
}: DoctorDirectoryPickerListProps) {
  const collapsedInset = bookingPickerCollapsedInsetClass;
  const [pickerOpen, setPickerOpen] = useState(true);
  const showList = dropdownMode ? true : !selectedDoctorId || pickerOpen;
  const scrollClass =
    scrollClassName ??
    (fillHeight ? doctorDirectoryPickerFillScrollClass : doctorDirectoryPickerScrollClass);

  if (isLoading) {
    return (
      <div className={cn(scrollClass, className)}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!doctors.length) {
    return (
      <p className={cn("text-sm text-muted-foreground px-2", className)}>
        No doctors available.
      </p>
    );
  }

  const selected = doctors.find((d) => d.id === selectedDoctorId);

  if (!showList && selected && !dropdownMode) {
    return (
      <div className={cn(collapsedInset, className)}>
        <DoctorDirectoryPickerCard doctor={selected} selected readOnly />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-full cursor-pointer text-sky-700 hover:bg-sky-50 hover:text-sky-900"
          onClick={() => setPickerOpen(true)}
        >
          <ChevronDown className="mr-1 h-4 w-4 rotate-180" aria-hidden />
          Change doctor
        </Button>
      </div>
    );
  }

  return (
    <ScrollOverflowPanel
      scrollClassName={cn(scrollClass, className)}
      enabled={showList}
      contentVersion={`${doctors.length}-${fillHeight ? 1 : 0}`}
      role="listbox"
      aria-label="Select a doctor"
    >
      {doctors.map((d) => (
        <DoctorDirectoryPickerCard
          key={d.id}
          doctor={d}
          selected={d.id === selectedDoctorId}
          onSelect={(id) => {
            onSelectDoctor(id);
            if (dropdownMode) onAfterSelect?.();
            else setPickerOpen(false);
          }}
        />
      ))}
    </ScrollOverflowPanel>
  );
}
