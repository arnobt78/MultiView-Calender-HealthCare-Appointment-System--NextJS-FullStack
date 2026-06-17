"use client";

import { createElement } from "react";
import { CalendarDays, CalendarClock, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  formatGoogleCalendarEventWhenRange,
  getGoogleCalendarEventDescriptionPreview,
  getGoogleCalendarEventScheduleLabel,
  getGoogleCalendarEventTitle,
  isGoogleCalendarEventAllDay,
} from "@/lib/google-calendar-display";
import { resolveGoogleCalendarEventStatusMeta } from "@/lib/google-calendar-event-status-display";
import {
  clinicalCellMutedTextClass,
  clinicalCellPrimaryTextClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";
import type { GoogleCalendarEvent } from "@/types/google-calendar";
import { cn } from "@/lib/utils";

/** Event title + optional description snippet — CP list identity stack parity. */
export function GoogleCalendarEventTitleTableCell({ event }: { event: GoogleCalendarEvent }) {
  const title = getGoogleCalendarEventTitle(event);
  const description = getGoogleCalendarEventDescriptionPreview(event);

  return (
    <div className={cn(clinicalTableCellMinRowClass, "flex min-w-0 flex-col gap-0.5 py-0.5")}>
      <span className={cn("line-clamp-2 text-sm font-medium", clinicalCellPrimaryTextClass)}>
        {title}
      </span>
      {description ? (
        <span className={cn("line-clamp-2 text-xs", clinicalCellMutedTextClass)}>{description}</span>
      ) : null}
    </div>
  );
}

/** Merged When column — clock range + location (mirrors AppointmentWhenTableCell). */
export function GoogleCalendarEventWhenTableCell({ event }: { event: GoogleCalendarEvent }) {
  const whenLabel = formatGoogleCalendarEventWhenRange(event);
  const location = event.location?.trim();

  return (
    <div className={cn(clinicalTableCellMinRowClass, "flex min-w-0 flex-col gap-0.5 py-0.5")}>
      <span
        className={cn(
          "inline-flex max-w-full min-w-0 items-start gap-1 self-start",
          clinicalCellMutedTextClass
        )}
      >
        <Clock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        <span className="min-w-0 break-words tabular-nums [overflow-wrap:break-word]">
          {whenLabel}
        </span>
      </span>
      <span
        className={cn(
          "inline-flex max-w-full min-w-0 items-start gap-1 self-start break-words [overflow-wrap:break-word]",
          clinicalCellMutedTextClass
        )}
      >
        <MapPin className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        {location || "—"}
      </span>
    </div>
  );
}

/** All-day vs Timed — aligns with schedule filter dropdown. */
export function GoogleCalendarEventScheduleBadge({ event }: { event: GoogleCalendarEvent }) {
  const label = getGoogleCalendarEventScheduleLabel(event);
  const allDay = isGoogleCalendarEventAllDay(event);
  const Icon = allDay ? CalendarDays : CalendarClock;

  return (
    <Badge
      variant="outline"
      className={cn(
        "calendar-glass-badge inline-flex w-fit shrink-0 items-center gap-1 py-0 text-[10px] font-normal",
        allDay ? "calendar-glass-badge-violet" : "calendar-glass-badge-blue"
      )}
    >
      {createElement(Icon, { className: "h-3 w-3 shrink-0", "aria-hidden": true })}
      <span>{label}</span>
    </Badge>
  );
}

/** Google API status — confirmed / tentative / cancelled. */
export function GoogleCalendarEventStatusBadge({ event }: { event: GoogleCalendarEvent }) {
  const meta = resolveGoogleCalendarEventStatusMeta(event.status);

  return (
    <Badge
      variant="outline"
      className={cn(
        "calendar-glass-badge inline-flex w-fit shrink-0 items-center gap-1 py-0 text-[10px] font-normal capitalize",
        meta.glassClass
      )}
    >
      {createElement(meta.Icon, { className: "h-3 w-3 shrink-0", "aria-hidden": true })}
      <span>{meta.label}</span>
    </Badge>
  );
}
