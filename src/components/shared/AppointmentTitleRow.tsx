"use client";

/**
 * Appointment title + day tag. Grid triggers: truncated single line beside badge.
 * Hover / month detail (`wrapTitle`): title flows as normal inline text with break-words;
 * date pill sits inline at the end of the line — not a flex column that squeezes the title.
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
  /** Month side panel: title full width, date pill on next line (avoids narrow-column wrap). */
  titleLayout?: "inline" | "stacked";
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
  titleLayout = "inline",
  dateTag,
}: AppointmentTitleRowProps) {
  if (wrapTitle && titleLayout === "stacked") {
    return (
      <div className={cn("min-w-0 w-full text-sm leading-snug", className)}>
        <RoleEntityLink
          kind="appointment"
          id={appointmentId}
          label={title}
          wrapLabel
          className={cn(
            "block w-full font-normal",
            isDone && "line-through text-gray-400"
          )}
        />
        <div className="mt-1">
          {dateTag ?? <AppointmentDateTag date={appointmentStart} />}
        </div>
      </div>
    );
  }

  if (wrapTitle) {
    return (
      <div className={cn("min-w-0 text-sm leading-snug", className)}>
        <RoleEntityLink
          kind="appointment"
          id={appointmentId}
          label={title}
          wrapLabel
          className={cn(
            "inline font-normal",
            isDone && "line-through text-gray-400"
          )}
        />
        {dateTag ?? (
          <AppointmentDateTag
            date={appointmentStart}
            className="ml-1.5 inline-flex align-middle"
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm leading-snug",
        className
      )}
    >
      <RoleEntityLink
        kind="appointment"
        id={appointmentId}
        label={title}
        className={cn(
          "min-w-0 max-w-full shrink text-sm font-normal",
          isDone && "line-through text-gray-400"
        )}
      />
      {dateTag ?? <AppointmentDateTag date={appointmentStart} className="shrink-0" />}
    </div>
  );
}
