"use client";

import { format, isToday } from "date-fns";
import { resolveDashboardAppointmentRelativeTone } from "@/lib/dashboard-appointment-relative-time";
import {
  telehealthQueueListTimeEndedClass,
  telehealthQueueListTimeInProgressPrimaryClass,
  telehealthQueueListTimeInProgressSecondaryClass,
  telehealthQueueListTimePrimaryClass,
  telehealthQueueListTimeSecondaryClass,
} from "@/lib/telehealth-queue-list-time";
import { cn } from "@/lib/utils";

type Props = {
  start: string;
  inProgress?: boolean;
  ended?: boolean;
  className?: string;
};

/** Schedule list left gutter — tonal clock + period + optional weekday/date (no duplicate badge chip). */
export function TelehealthQueueListTimeColumn({
  start,
  inProgress = false,
  ended = false,
  className,
}: Props) {
  const startDate = new Date(start);
  const tone = resolveDashboardAppointmentRelativeTone(start);
  const showDate = !isToday(startDate);

  const primaryClass = ended
    ? telehealthQueueListTimeEndedClass
    : inProgress
      ? telehealthQueueListTimeInProgressPrimaryClass
      : telehealthQueueListTimePrimaryClass[tone];

  const secondaryClass = ended
    ? telehealthQueueListTimeEndedClass
    : inProgress
      ? telehealthQueueListTimeInProgressSecondaryClass
      : telehealthQueueListTimeSecondaryClass[tone];

  return (
    <div className={cn("w-17 shrink-0 pt-0.5 text-center", className)}>
      <p
        className={cn(
          "text-xl font-bold tabular-nums leading-none tracking-tight",
          primaryClass
        )}
      >
        {format(startDate, "h:mm")}
      </p>
      <p
        className={cn(
          "mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
          secondaryClass
        )}
      >
        {format(startDate, "a")}
      </p>
      {showDate ? (
        <>
          <p className={cn("mt-1 text-[10px] font-semibold leading-tight", secondaryClass)}>
            {format(startDate, "EEE")}
          </p>
          <p
            className={cn(
              "text-[10px] font-medium leading-tight opacity-90",
              secondaryClass
            )}
          >
            {format(startDate, "MMM d")}
          </p>
        </>
      ) : null}
    </div>
  );
}
