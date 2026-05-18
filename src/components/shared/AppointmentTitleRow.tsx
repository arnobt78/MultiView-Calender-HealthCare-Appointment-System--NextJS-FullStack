"use client";

/**
 * Appointment title + day tag. Grid triggers: truncated single line.
 * Hover / month detail: `wrapTitle` for full multi-line title + real-calendar badge.
 */

import { cn } from "@/lib/utils";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { AppointmentDateTag } from "@/components/shared/AppointmentDateTag";

type AppointmentTitleRowProps = {
  appointmentId: string;
  title: string;
  appointmentStart: Date;
  isDone?: boolean;
  className?: string;
  /** Multi-line title (hover popover, month side panel). */
  wrapTitle?: boolean;
  /** @deprecated Do not pass — badges always use real calendar today. */
  referenceDate?: Date;
  /** @deprecated Do not pass — use `AppointmentDateTag` only. */
  dateTag?: React.ReactNode;
};

export function AppointmentTitleRow({
  appointmentId,
  title,
  appointmentStart,
  isDone,
  className,
  wrapTitle,
  dateTag,
}: AppointmentTitleRowProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 gap-2",
        wrapTitle ? "flex-wrap items-start" : "items-center",
        className
      )}
    >
      <RoleEntityLink
        kind="appointment"
        id={appointmentId}
        label={title}
        className={cn(
          "min-w-0 flex-1 text-sm font-normal",
          wrapTitle
            ? "break-words [overflow-wrap:anywhere] whitespace-normal"
            : "truncate",
          isDone && "line-through text-gray-400"
        )}
      />
      {dateTag ?? <AppointmentDateTag date={appointmentStart} />}
    </div>
  );
}
