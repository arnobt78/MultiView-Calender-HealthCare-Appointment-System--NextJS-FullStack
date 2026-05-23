"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";
import { SchedulingMonthCalendar } from "@/components/shared/scheduling/SchedulingMonthCalendar";
import { SchedulingSlotChipGrid } from "@/components/shared/scheduling/SchedulingSlotChipGrid";
import { useSchedulingDayGrid } from "@/hooks/useSchedulingDayGrid";
import type { FlexDurationMinutes } from "@/lib/scheduling/flexible-type-config";
import type { SchedulingScopeKey } from "@/lib/scheduling/scheduling-types";
import { cn } from "@/lib/utils";
import { schedulingSplitSlotsRailBoundsClass } from "@/lib/scheduling/scheduling-ui-classes";

export type SchedulingPanelProps = {
  doctorId: string;
  typeId: string;
  typeDuration: number;
  dateStr: string;
  onDateStrChange: (value: string) => void;
  selectedSlot: string | null;
  onSelectSlot: (iso: string) => void;
  excludeAppointmentId?: string;
  today: string;
  /** Flexible booking — month calendar from flex duration; no slot grid. */
  isFlexible?: boolean;
  flexDurationMinutes?: FlexDurationMinutes;
  /** `split` = calendar left, slots right on sm+; `stack` = vertical (legacy). */
  layout?: "split" | "stack";
  fillLayout?: boolean;
  /** Omit inner month caption when parent already labels the scheduling section. */
  hideCalendarCaption?: boolean;
  className?: string;
};

/**
 * Shared scheduling: month calendar + slot grid (or flexible month-only).
 * Default `layout="split"` uses dialog width — slots scroll in the right rail.
 */
export function SchedulingPanel({
  doctorId,
  typeId,
  typeDuration,
  dateStr,
  onDateStrChange,
  selectedSlot,
  onSelectSlot,
  excludeAppointmentId,
  today,
  isFlexible = false,
  flexDurationMinutes = 30,
  layout = "split",
  fillLayout = false,
  hideCalendarCaption = false,
  className,
}: SchedulingPanelProps) {
  const isSplit = layout === "split";
  const railFill = fillLayout || isSplit;

  const schedulingScope: SchedulingScopeKey = useMemo(() => {
    if (isFlexible) {
      return { kind: "flex", durationMinutes: flexDurationMinutes };
    }
    return { kind: "type", typeId };
  }, [isFlexible, flexDurationMinutes, typeId]);

  const showTypedSlots = Boolean(dateStr && !isFlexible && typeId);

  const { data: gridData, isLoading: slotsLoading } = useSchedulingDayGrid({
    doctorId,
    dateStr: showTypedSlots ? dateStr : null,
    typeId: showTypedSlots ? typeId : null,
    excludeAppointmentId,
    enabled: showTypedSlots,
  });

  const slotsRail = (
    <>
      {isFlexible ? (
        <div className="flex flex-1 flex-col justify-center rounded-2xl border border-sky-200/50 bg-sky-50/40 p-4">
          <p className="text-sm text-muted-foreground break-words">
            Flexible booking — pick a date on the calendar, then set your preferred time on the
            next step.
          </p>
        </div>
      ) : showTypedSlots ? (
        <SchedulingSlotChipGrid
          dateStr={dateStr}
          duration={typeDuration}
          cells={gridData?.cells ?? []}
          selectedStart={selectedSlot}
          onSelect={onSelectSlot}
          isLoading={slotsLoading}
          variant={isSplit ? "rail" : "default"}
          fillLayout={railFill}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-sky-200/80 bg-sky-50/30 p-6 text-center">
          <Clock className="mb-2 h-8 w-8 text-sky-400/80" />
          <p className="text-sm font-medium text-sky-900">Select a date</p>
          <p className="mt-1 text-xs text-muted-foreground break-words">
            Available time slots will appear here after you pick a day on the calendar.
          </p>
        </div>
      )}
    </>
  );

  if (!isSplit) {
    return (
      <div className={cn("flex flex-col gap-4", fillLayout && "min-h-0 flex-1", className)}>
        <SchedulingMonthCalendar
          doctorId={doctorId}
          schedulingScope={schedulingScope}
          dateStr={dateStr}
          onDateStrChange={onDateStrChange}
          excludeAppointmentId={excludeAppointmentId}
          today={today}
          hideCaption={hideCalendarCaption}
        />
        {!isFlexible && !showTypedSlots ? null : slotsRail}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-4",
        fillLayout && "min-h-0 flex-1",
        className
      )}
    >
      <div className="shrink-0 sm:w-[min(100%,320px)]">
        <SchedulingMonthCalendar
          doctorId={doctorId}
          schedulingScope={schedulingScope}
          dateStr={dateStr}
          onDateStrChange={onDateStrChange}
          excludeAppointmentId={excludeAppointmentId}
          today={today}
          compact
          hideCaption={hideCalendarCaption}
        />
      </div>
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          fillLayout
            ? schedulingSplitSlotsRailBoundsClass
            : "min-h-[200px] sm:min-h-[280px] sm:max-h-[min(320px,45vh)]"
        )}
      >
        {slotsRail}
      </div>
    </div>
  );
}
