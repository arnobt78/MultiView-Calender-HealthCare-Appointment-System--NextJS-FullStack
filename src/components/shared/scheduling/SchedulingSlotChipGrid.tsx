"use client";

import { addMinutes, format } from "date-fns";
import { CalendarX, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SlotCell } from "@/lib/scheduling/scheduling-types";
import { patientBookingGlassInputClass } from "@/components/shared/patient-booking/patient-booking-dialog-styles";
import {
  schedulingSlotChipAvailableClass,
  schedulingSlotChipCellClass,
  schedulingSlotChipDisabledClass,
  schedulingSlotChipSelectedClass,
  schedulingSlotGridClass,
  schedulingSlotGridScrollClass,
} from "@/lib/scheduling/scheduling-ui-classes";

function SchedulingSlotTimeInline({
  startLabel,
  endLabel,
  muted,
}: {
  startLabel: string;
  endLabel: string;
  muted?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 whitespace-nowrap tabular-nums leading-none",
        muted && "opacity-80"
      )}
    >
      <span className="text-sm font-medium">{startLabel}</span>
      <span className="text-[10px] font-normal opacity-75" aria-hidden>
        →
      </span>
      <span className="text-xs font-normal">{endLabel}</span>
    </span>
  );
}

type SchedulingSlotChipGridProps = {
  dateStr: string;
  duration: number;
  cells: SlotCell[];
  selectedStart: string | null;
  onSelect: (iso: string) => void;
  isLoading: boolean;
  /** `rail` = scrollable slot column beside calendar; `default` = stacked panel grid. */
  variant?: "default" | "rail";
  fillLayout?: boolean;
  className?: string;
};

/**
 * Cal.com-style slot chips — shows booked/past/blocked as muted disabled buttons.
 * Glow: scroll-root `px` inset + per-cell `schedulingSlotChipCellClass` (overflow cannot use -m bleed).
 */
export function SchedulingSlotChipGrid({
  dateStr,
  duration,
  cells,
  selectedStart,
  onSelect,
  isLoading,
  variant = "default",
  fillLayout = false,
  className,
}: SchedulingSlotChipGridProps) {
  const isRail = variant === "rail";
  const dateLabel = dateStr
    ? format(new Date(`${dateStr}T12:00:00`), "EEE, dd MMM yyyy")
    : "";

  const gridClass = isRail ? schedulingSlotGridClass.rail : schedulingSlotGridClass.default;

  const scrollClass = isRail
    ? cn(
        schedulingSlotGridScrollClass.rail,
        !fillLayout && "sm:max-h-[min(320px,45vh)]"
      )
    : cn(
        fillLayout ? cn("min-h-0 flex-1", schedulingSlotGridScrollClass.default) : schedulingSlotGridScrollClass.defaultCapped
      );

  const slotGrid = (gridClassName: string) => (
    <div className={gridClassName}>
      {cells.map((cell) => {
        const slotTime = format(new Date(cell.start), "HH:mm");
        const endTime = format(addMinutes(new Date(cell.start), duration), "HH:mm");
        const selected = selectedStart === cell.start;
        const selectable = cell.status === "available";
        return (
          <div key={cell.start} className={schedulingSlotChipCellClass}>
            <button
              type="button"
              disabled={!selectable}
              onClick={() => selectable && onSelect(cell.start)}
              className={cn(
                "flex w-full items-center justify-center rounded-xl border px-2 py-2 transition-all",
                selectable &&
                  (selected ? schedulingSlotChipSelectedClass : schedulingSlotChipAvailableClass),
                !selectable && schedulingSlotChipDisabledClass,
                cell.status === "booked" && "line-through decoration-slate-400/80"
              )}
              aria-pressed={selected}
              aria-disabled={!selectable}
            >
              <SchedulingSlotTimeInline
                startLabel={slotTime}
                endLabel={endTime}
                muted={!selectable}
              />
            </button>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col gap-2",
        isRail && "min-h-0 flex-1",
        className
      )}
    >
      <Label className="flex shrink-0 flex-wrap items-center gap-1.5 break-words">
        <Clock className="h-4 w-4 shrink-0 text-sky-600" />
        <span className="break-words">Select Available Slots</span>
        {dateLabel ? (
          <span className="text-muted-foreground font-normal">— {dateLabel}</span>
        ) : null}
      </Label>
      {isLoading ? (
        <div className={scrollClass}>
          <div className={gridClass}>
            {Array.from({ length: isRail ? 6 : 9 }).map((_, i) => (
              <div key={i} className={schedulingSlotChipCellClass}>
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      ) : cells.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-sky-200/80 p-6 text-center">
          <div>
            <CalendarX className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm font-medium">No slots available</p>
            <p className="mt-1 text-xs text-muted-foreground break-words">
              Try a different date or doctor.
            </p>
          </div>
        </div>
      ) : (
        <div className={scrollClass}>{slotGrid(gridClass)}</div>
      )}
    </div>
  );
}

/** Shared glass input for flexible-booking date fallback. */
export const schedulingGlassDateInputClass = patientBookingGlassInputClass;
