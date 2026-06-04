"use client";

import { useState } from "react";
import { ChevronDown, Clock, Euro, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  formatAppointmentTypeBufferLine,
  formatAppointmentTypeSlotStepLine,
  type AppointmentTypeSchedulingFields,
} from "@/lib/appointment-type-scheduling-meta";
import type { FlexDurationMinutes } from "@/lib/scheduling/flexible-type-config";
import { ScrollOverflowPanel } from "@/components/shared/ScrollOverflowPanel";
import {
  bookingPickerCollapsedInsetClass,
  bookingPickerScrollClass,
  patientBookingFillScrollPanelClass,
  patientBookingGlassTileClass,
  patientBookingGlassTileSelectedClass,
} from "@/components/shared/patient-booking/patient-booking-dialog-styles";
import { bookingVisitFeeInfoNote } from "@/lib/appointment-visit-fee-display";

/** Minimal fields for visit-type tiles (patient wizard + staff dialog). */
export type VisitTypePickerItem = AppointmentTypeSchedulingFields & {
  id: string;
  name: string;
  /** Visit fee in cents — 0 = no explicit price. Shown as emerald price badge on each tile. */
  price_cents?: number;
};

type VisitTypePickerListProps = {
  typesLoading: boolean;
  isFlexible: boolean;
  types: VisitTypePickerItem[];
  selectedType: VisitTypePickerItem | null;
  onSelectType: (type: VisitTypePickerItem) => void;
  flexDuration: FlexDurationMinutes;
  onFlexDurationChange: (minutes: FlexDurationMinutes) => void;
  fillLayout?: boolean;
  /** Override typed-list scroll classes (staff dialog flush inset). */
  scrollClassName?: string;
  /** @deprecated Staff dialog — default inset matches patient booking. */
  flushInset?: boolean;
  /** Staff dropdown field — trigger shows selection; no inline collapsed summary card. */
  dropdownMode?: boolean;
  onAfterSelect?: () => void;
  className?: string;
};

/** Collapsed visit-type row — patient step 1 and staff appointment dropdown field. */
export function VisitTypeSummaryCard({
  type,
  flexLabel,
}: {
  type?: VisitTypePickerItem;
  flexLabel?: string;
}) {
  const title = flexLabel ?? type?.name ?? "";
  const duration = type?.duration_minutes;
  const priceCents = type?.price_cents ?? 0;

  return (
    <div
      className={cn(patientBookingGlassTileClass, patientBookingGlassTileSelectedClass)}
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{title}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          {duration != null ? (
            <Badge variant="outline" className="gap-1 text-xs calendar-glass-badge-sky">
              <Clock className="h-3 w-3" />
              {duration} min
            </Badge>
          ) : flexLabel ? (
            <Badge variant="outline" className="gap-1 text-xs calendar-glass-badge-sky">
              <Clock className="h-3 w-3" />
              {flexLabel.replace(/^Flexible booking · /, "")}
            </Badge>
          ) : null}
          {priceCents > 0 && (
            <Badge variant="outline" className="gap-1 text-xs calendar-glass-badge-emerald">
              <Euro className="h-3 w-3" />
              {(priceCents / 100).toFixed(2)}
            </Badge>
          )}
        </div>
      </div>
      {type
        ? (() => {
            const bufferLine = formatAppointmentTypeBufferLine(type);
            const slotLine = formatAppointmentTypeSlotStepLine(type);
            if (!bufferLine && !slotLine) return null;
            return (
              <p className="mt-1 text-xs text-muted-foreground">{bufferLine ?? slotLine}</p>
            );
          })()
        : null}
    </div>
  );
}

/**
 * Shared visit-type tiles — patient booking step 1 and staff appointment dialog.
 * Collapses to summary + “Change appointment type” after selection.
 */
export function VisitTypePickerList({
  typesLoading,
  isFlexible,
  types,
  selectedType,
  onSelectType,
  flexDuration,
  onFlexDurationChange,
  fillLayout = false,
  scrollClassName,
  flushInset: _flushInset = false,
  dropdownMode = false,
  onAfterSelect,
  className,
}: VisitTypePickerListProps) {
  const collapsedInset = bookingPickerCollapsedInsetClass;
  const [pickerOpen, setPickerOpen] = useState(true);
  const [flexPicked, setFlexPicked] = useState(false);

  const flexCollapsed = isFlexible && flexPicked;
  const typeCollapsed = !isFlexible && Boolean(selectedType) && !pickerOpen;
  const showList = dropdownMode
    ? true
    : isFlexible
      ? !flexPicked || pickerOpen
      : !selectedType || pickerOpen;

  if (typesLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isFlexible) {
    if (!showList && flexCollapsed && !dropdownMode) {
      return (
        <div className={cn(collapsedInset, className)}>
          <VisitTypeSummaryCard flexLabel={`Flexible booking · ${flexDuration} min`} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-full cursor-pointer text-sky-700 hover:bg-sky-50 hover:text-sky-900"
            onClick={() => setPickerOpen(true)}
          >
            <ChevronDown className="mr-1 h-4 w-4 rotate-180" aria-hidden />
            Change appointment type
          </Button>
        </div>
      );
    }

    return (
      <div
        className={cn(
          fillLayout ? patientBookingFillScrollPanelClass : "space-y-2",
          className
        )}
      >
        <div className="rounded-2xl border border-sky-200/60 bg-sky-50/60 p-4 space-y-2 shadow-[0_10px_30px_rgba(2,132,199,0.1)]">
          <p className="text-sm font-medium text-sky-800">Flexible Booking</p>
          <p className="text-xs text-muted-foreground">
            This doctor hasn&apos;t set fixed appointment types. Choose a duration.
          </p>
          <div className="flex flex-wrap gap-2">
            {([15, 30, 45, 60] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  onFlexDurationChange(d);
                  setFlexPicked(true);
                  if (dropdownMode) onAfterSelect?.();
                  else setPickerOpen(false);
                }}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                  flexDuration === d
                    ? "border-sky-500 bg-sky-600 text-white shadow-[0_8px_20px_rgba(2,132,199,0.35)]"
                    : "border-sky-200/80 bg-white/90 text-sky-800 hover:bg-sky-50"
                )}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (typeCollapsed && selectedType && !dropdownMode) {
    return (
      <div className={cn(collapsedInset, className)}>
        <VisitTypeSummaryCard type={selectedType} />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-full cursor-pointer text-sky-700 hover:bg-sky-50 hover:text-sky-900"
          onClick={() => setPickerOpen(true)}
        >
          <ChevronDown className="mr-1 h-4 w-4 rotate-180" aria-hidden />
          Change appointment type
        </Button>
      </div>
    );
  }

  const typeScrollClass = cn(
    scrollClassName ?? (fillLayout ? patientBookingFillScrollPanelClass : bookingPickerScrollClass),
    className
  );

  return (
    <ScrollOverflowPanel
      scrollClassName={typeScrollClass}
      enabled={showList}
      contentVersion={`${types.length}-${fillLayout ? 1 : 0}`}
      role="listbox"
      aria-label="Select appointment type"
    >
      {types.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => {
            onSelectType(t);
            if (dropdownMode) onAfterSelect?.();
            else setPickerOpen(false);
          }}
          className={cn(
            patientBookingGlassTileClass,
            selectedType?.id === t.id && patientBookingGlassTileSelectedClass
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{t.name}</span>
            <div className="flex shrink-0 items-center gap-1.5">
              <Badge variant="outline" className="gap-1 text-xs calendar-glass-badge-sky">
                <Clock className="h-3 w-3" />
                {t.duration_minutes} min
              </Badge>
              {(t.price_cents ?? 0) > 0 && (
                <Badge variant="outline" className="gap-1 text-xs calendar-glass-badge-emerald">
                  <Euro className="h-3 w-3" />
                  {((t.price_cents ?? 0) / 100).toFixed(2)}
                </Badge>
              )}
            </div>
          </div>
          {(() => {
            const bufferLine = formatAppointmentTypeBufferLine(t);
            const slotLine = formatAppointmentTypeSlotStepLine(t);
            if (!bufferLine && !slotLine) return null;
            return (
              <p className="mt-1 text-xs text-muted-foreground">{bufferLine ?? slotLine}</p>
            );
          })()}
        </button>
      ))}
      {types.length > 0 ? (
        <div className="flex items-start gap-1.5 rounded-xl border border-sky-200/50 bg-sky-50/60 px-3 py-2">
          <Info className="mt-0.5 h-3 w-3 shrink-0 text-sky-600" aria-hidden />
          <p className="text-[11px] leading-relaxed text-sky-800">{bookingVisitFeeInfoNote()}</p>
        </div>
      ) : null}
    </ScrollOverflowPanel>
  );
}
