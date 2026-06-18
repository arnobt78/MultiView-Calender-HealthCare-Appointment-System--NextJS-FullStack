"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSchedulingMonthDates } from "@/hooks/useSchedulingMonthDates";
import type { MonthDayStatus, SchedulingScopeKey } from "@/lib/scheduling/scheduling-types";
import { schedulingScopeKeySegment } from "@/lib/scheduling/scheduling-scope";
import { prefetchSchedulingMonthsAdjacent } from "@/lib/prefetch-scheduling";
import { schedulingMonthCalendarClassNames } from "@/lib/scheduling/scheduling-ui-classes";
import { SchedulingMonthCaptionBar } from "@/components/shared/scheduling/SchedulingMonthCaptionBar";
import { queryKeys } from "@/lib/query-keys";
import { useQueryBodyLoading } from "@/lib/query-body-loading";
import {
  isSchedulingMonthDayDisabled,
  resolveDefaultSchedulingDateStr,
} from "@/lib/scheduling/default-scheduling-date";
import { isValidUUID } from "@/lib/validation";

type SchedulingMonthCalendarProps = {
  doctorId: string;
  schedulingScope: SchedulingScopeKey;
  dateStr: string;
  onDateStrChange: (value: string) => void;
  excludeAppointmentId?: string;
  today: string;
  /** Side-by-side layout: calendar fits content width instead of stretching full row. */
  compact?: boolean;
  /** Staff dialog — parent section already titles the block; omit inner "Pick a Date" row. */
  hideCaption?: boolean;
  /** When true (default), pick first bookable day once month map loads if `dateStr` is empty. */
  autoSelectDefaultDate?: boolean;
  className?: string;
};

function toMonthYm(d: Date): string {
  return format(d, "yyyy-MM");
}

function parseDateStr(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  return parseISO(`${dateStr}T12:00:00`);
}

/**
 * shadcn month picker — only `open` days are selectable; past/unavailable/full disabled.
 * Prefetches adjacent months on navigation so prev/next month feels instant.
 * Calendar chrome always mounts; day-status opacity pulses only when month cache is cold.
 */
export function SchedulingMonthCalendar({
  doctorId,
  schedulingScope,
  dateStr,
  onDateStrChange,
  excludeAppointmentId,
  today,
  compact = false,
  hideCaption = false,
  autoSelectDefaultDate = true,
  className,
}: SchedulingMonthCalendarProps) {
  const queryClient = useQueryClient();
  const selected = parseDateStr(dateStr);
  const [month, setMonth] = useState<Date>(() => selected ?? parseISO(`${today}T12:00:00`));
  const monthYm = toMonthYm(month);
  const scopeKey = schedulingScopeKeySegment(schedulingScope);
  const monthDatesKey = queryKeys.availability.dates(
    doctorId,
    scopeKey,
    monthYm,
    excludeAppointmentId
  );

  // Align visible month when parent sets dateStr (e.g. wizard restore) without remounting Calendar.
  useEffect(() => {
    if (!dateStr) return;
    const picked = parseDateStr(dateStr);
    if (!picked) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync visible month from controlled dateStr
    setMonth((prev) => {
      if (toMonthYm(prev) === toMonthYm(picked)) return prev;
      return picked;
    });
  }, [dateStr]);

  const { data, isLoading } = useSchedulingMonthDates({
    doctorId,
    schedulingScope,
    monthYm,
    excludeAppointmentId,
  });

  const monthBodyLoading = useQueryBodyLoading(monthDatesKey, isLoading);

  // Seed parent dateStr from month map so slot grid loads without a manual calendar click.
  useEffect(() => {
    if (!autoSelectDefaultDate || dateStr) return;
    if (!isValidUUID(doctorId) || isLoading) return;
    const days = data?.days;
    if (!days?.length) return;
    const next = resolveDefaultSchedulingDateStr(today, days);
    if (next) onDateStrChange(next);
  }, [
    autoSelectDefaultDate,
    dateStr,
    doctorId,
    isLoading,
    data?.days,
    today,
    onDateStrChange,
  ]);

  const statusByDate = useMemo(() => {
    const map = new Map<string, MonthDayStatus>();
    for (const d of data?.days ?? []) {
      map.set(d.date, d.status);
    }
    return map;
  }, [data?.days]);

  const disabledMatchers = useMemo(() => {
    const todayDate = parseISO(`${today}T12:00:00`);
    return [
      { before: todayDate },
      (day: Date) => {
        const key = format(day, "yyyy-MM-dd");
        const status = statusByDate.get(key);
        return isSchedulingMonthDayDisabled(status);
      },
    ];
  }, [statusByDate, today]);

  function handleMonthChange(next: Date) {
    setMonth(next);
    prefetchSchedulingMonthsAdjacent(queryClient, {
      doctorId,
      schedulingScope,
      monthYm: toMonthYm(next),
      excludeAppointmentId,
    });
  }

  return (
    <div className={cn(hideCaption ? "space-y-0" : "space-y-1.5", className)}>
      {!hideCaption ? (
        <Label className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-sky-600" />
          Pick a Date
        </Label>
      ) : null}
      <div
        className={cn(
          "rounded-2xl border border-sky-200/60 bg-white/90 p-2 shadow-[0_10px_30px_rgba(2,132,199,0.12)]",
          compact ? "w-fit max-w-full" : "w-full",
          monthBodyLoading && "opacity-80"
        )}
      >
        <Calendar
          mode="single"
          hideNavigation
          selected={selected}
          onSelect={(d) => {
            if (d) onDateStrChange(format(d, "yyyy-MM-dd"));
          }}
          month={month}
          onMonthChange={handleMonthChange}
          disabled={disabledMatchers}
          className={cn("p-1", compact ? "mx-0" : "mx-auto")}
          classNames={schedulingMonthCalendarClassNames}
          components={{
            MonthCaption: SchedulingMonthCaptionBar,
          }}
        />
      </div>
    </div>
  );
}
