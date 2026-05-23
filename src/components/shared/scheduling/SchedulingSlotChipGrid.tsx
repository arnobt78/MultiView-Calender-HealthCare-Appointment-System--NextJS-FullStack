"use client";

import { addMinutes, format } from "date-fns";
import { CalendarX, Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { SlotCell } from "@/lib/scheduling/scheduling-types";
import { patientBookingGlassInputClass } from "@/components/shared/patient-booking/patient-booking-dialog-styles";
import { schedulingSlotGridClass } from "@/lib/scheduling/scheduling-ui-classes";

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
        "min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1",
        !fillLayout && "sm:max-h-[min(320px,45vh)]"
      )
    : cn(fillLayout ? "min-h-0 flex-1 overflow-y-auto" : "max-h-56 overflow-y-auto");

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
        <div className={cn(gridClass, scrollClass)}>
          {Array.from({ length: isRail ? 6 : 9 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
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
        <div className={cn(gridClass, scrollClass)}>
          {cells.map((cell) => {
            const slotTime = format(new Date(cell.start), "HH:mm");
            const endTime = format(addMinutes(new Date(cell.start), duration), "HH:mm");
            const selected = selectedStart === cell.start;
            const selectable = cell.status === "available";
            return (
              <button
                key={cell.start}
                type="button"
                disabled={!selectable}
                onClick={() => selectable && onSelect(cell.start)}
                className={cn(
                  "flex w-full items-center justify-center rounded-xl border px-2 py-2 transition-all",
                  selectable &&
                    (selected
                      ? "border-sky-500 bg-sky-600 text-white shadow-[0_8px_20px_rgba(2,132,199,0.35)]"
                      : "border-sky-200/80 bg-white/90 text-sky-900 hover:border-sky-400 hover:bg-sky-50"),
                  !selectable &&
                    "cursor-not-allowed border-slate-200/80 bg-slate-50/90 text-slate-400 opacity-70",
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
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Shared glass input for flexible-booking date fallback. */
export const schedulingGlassDateInputClass = patientBookingGlassInputClass;
