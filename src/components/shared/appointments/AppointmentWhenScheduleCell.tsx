"use client";

import { format } from "date-fns";
import { Clock, MapPin } from "lucide-react";
import { AppointmentTypeGlassBadge } from "@/components/shared/appointment-display/AppointmentTypeGlassBadge";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import type { AppointmentWhenScheduleSource } from "@/lib/appointment-when-schedule-display";
import { resolveWhenScheduleLocationLabel } from "@/lib/appointment-when-schedule-display";
import {
  formatAppointmentTypeDurationLabel,
  resolveAppointmentTypeDurationMinutes,
  resolveAppointmentTypeDisplayName,
} from "@/lib/appointment-type-display";
import {
  clinicalCellMutedTextClass,
  clinicalTableCellMinRowClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

type Props = {
  source: AppointmentWhenScheduleSource;
  /** `management` — CP appointment table; `snapshot` — related appointments on entity detail. */
  layout?: "management" | "snapshot";
  className?: string;
};

/** Inline visit type + telehealth chips beside datetime — shared When column renderer. */
function WhenScheduleTypeBadges({
  source,
}: {
  source: AppointmentWhenScheduleSource;
}) {
  const typeName = resolveAppointmentTypeDisplayName(source);
  const durationLabel = formatAppointmentTypeDurationLabel(
    resolveAppointmentTypeDurationMinutes(source)
  );
  if (!typeName && !source.is_telehealth) return null;

  return (
    <>
      {typeName ? (
        <AppointmentTypeGlassBadge
          name={typeName}
          durationLabel={durationLabel}
          className="shrink-0"
        />
      ) : null}
      {source.is_telehealth ? <TelehealthSessionBadge /> : null}
    </>
  );
}

/**
 * When column — datetime + inline visit type/duration/telehealth; location on second row.
 */
export function AppointmentWhenScheduleCell({
  source,
  layout = "management",
  className,
}: Props) {
  const start = new Date(source.start);
  const end = source.end ? new Date(source.end) : null;
  const location = resolveWhenScheduleLocationLabel(source);

  if (layout === "snapshot") {
    const timeLabel =
      end && !Number.isNaN(end.getTime())
        ? `${format(start, "p")} – ${format(end, "p")}`
        : format(start, "p");

    return (
      <div
        className={cn(
          clinicalTableCellMinRowClass,
          "flex min-w-0 flex-col justify-center gap-0.5",
          className
        )}
      >
        <p className={cn(clinicalCellMutedTextClass, "whitespace-nowrap")}>
          {format(start, "PP")}
        </p>
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
          <p className={cn(clinicalCellMutedTextClass, "tabular-nums")}>{timeLabel}</p>
          <WhenScheduleTypeBadges source={source} />
        </div>
      </div>
    );
  }

  const whenLabel =
    end && !Number.isNaN(end.getTime())
      ? `${format(start, "dd MMM yyyy, HH:mm")} – ${format(end, "HH:mm")}`
      : format(start, "dd MMM yyyy, HH:mm");

  return (
    <div
      className={cn(
        clinicalTableCellMinRowClass,
        "flex min-w-0 flex-col gap-0.5 py-0.5",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex max-w-full min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 self-start",
          clinicalCellMutedTextClass
        )}
      >
        <span className="inline-flex min-w-0 items-start gap-1">
          <Clock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          <span className="min-w-0 break-words tabular-nums [overflow-wrap:break-word]">
            {whenLabel}
          </span>
        </span>
        <WhenScheduleTypeBadges source={source} />
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
