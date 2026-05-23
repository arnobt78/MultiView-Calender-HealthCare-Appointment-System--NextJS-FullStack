"use client";

import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDayPicker, type MonthCaptionProps } from "react-day-picker";
import { cn } from "@/lib/utils";
import { schedulingMonthCalendarClassNames } from "@/lib/scheduling/scheduling-ui-classes";

/**
 * Prev | Month Year | Next in one row — replaces default side-floating nav for smoother month changes.
 */
export function SchedulingMonthCaptionBar({
  calendarMonth,
  displayIndex,
  className,
  ...divProps
}: MonthCaptionProps) {
  const { goToMonth, previousMonth, nextMonth, labels } = useDayPicker();
  const caption = format(calendarMonth.date, "MMMM yyyy");

  if (displayIndex !== 0) {
    return (
      <div
        className={cn(schedulingMonthCalendarClassNames.month_caption, className)}
        {...divProps}
      >
        <span
          className={schedulingMonthCalendarClassNames.caption_label}
          role="status"
          aria-live="polite"
        >
          {caption}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(schedulingMonthCalendarClassNames.month_caption, className)}
      {...divProps}
    >
      <button
        type="button"
        className={schedulingMonthCalendarClassNames.button_previous}
        disabled={!previousMonth}
        aria-label={labels.labelPrevious(previousMonth)}
        onClick={() => previousMonth && goToMonth(previousMonth)}
      >
        <ChevronLeft className="size-4 text-sky-700" aria-hidden />
      </button>
      <span
        className={schedulingMonthCalendarClassNames.caption_label}
        role="status"
        aria-live="polite"
      >
        {caption}
      </span>
      <button
        type="button"
        className={schedulingMonthCalendarClassNames.button_next}
        disabled={!nextMonth}
        aria-label={labels.labelNext(nextMonth)}
        onClick={() => nextMonth && goToMonth(nextMonth)}
      >
        <ChevronRight className="size-4 text-sky-700" aria-hidden />
      </button>
    </div>
  );
}
