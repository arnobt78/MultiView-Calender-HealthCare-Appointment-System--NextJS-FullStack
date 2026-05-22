"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorDirectoryPickerCard } from "@/components/shared/doctor-display/DoctorDirectoryPickerCard";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import { cn } from "@/lib/utils";

/** Fixed cap — used when parent height is not flex-driven. */
export const doctorDirectoryPickerScrollClass =
  "max-h-[min(42vh,420px)] overflow-y-auto overflow-x-hidden px-2 py-2 space-y-3";

/** Grows with dialog body down to footer — parent chain: dialog form → `fillStepLayout` motion → section → this node. */
export const doctorDirectoryPickerFillScrollClass =
  "min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-2 py-2 space-y-3";

type DoctorDirectoryPickerListProps = {
  doctors: DoctorDirectoryRow[];
  selectedDoctorId: string;
  onSelectDoctor: (doctorId: string) => void;
  isLoading?: boolean;
  /** Use dialog flex height instead of `max-h-[42vh]`. */
  fillHeight?: boolean;
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
  className,
}: DoctorDirectoryPickerListProps) {
  const [pickerOpen, setPickerOpen] = useState(true);
  const showList = !selectedDoctorId || pickerOpen;
  const scrollClass = fillHeight
    ? doctorDirectoryPickerFillScrollClass
    : doctorDirectoryPickerScrollClass;

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
      <p className={cn("text-sm text-muted-foreground px-2", className)}>No doctors available.</p>
    );
  }

  const selected = doctors.find((d) => d.id === selectedDoctorId);

  if (!showList && selected) {
    return (
      <div className={cn("space-y-2 px-2 py-1", className)}>
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
    <div
      className={cn(scrollClass, className)}
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
            setPickerOpen(false);
          }}
        />
      ))}
    </div>
  );
}
