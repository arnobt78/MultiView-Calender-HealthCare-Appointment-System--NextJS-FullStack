"use client";

import { Calendar, Clock3, MapPin } from "lucide-react";
import { AppointmentTypeGlassBadge } from "@/components/shared/appointment-display/AppointmentTypeGlassBadge";
import { AppointmentCardMetaRow } from "@/components/shared/AppointmentCardMetaRow";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import type { InvoiceVisitMetaInput } from "@/lib/invoice-visit-meta-line";
import {
  formatAppointmentTypeDurationLabel,
  resolveAppointmentTypeDurationMinutes,
  resolveAppointmentTypeDisplayName,
} from "@/lib/appointment-type-display";
import {
  formatInvoiceVisitMetaTextLine,
  resolveInvoiceVisitMetaIcons,
} from "@/lib/invoice-visit-meta-line";
import { cn } from "@/lib/utils";

type Props = {
  source: InvoiceVisitMetaInput;
  /** `icons` — summary card; `text` — single muted line on picker tiles. */
  variant?: "icons" | "text";
  className?: string;
};

/**
 * When / time / location / telehealth — shared by InvoiceVisitSummaryCard + directory picker.
 */
export function InvoiceVisitMetaLine({
  source,
  variant = "icons",
  className,
}: Props) {
  if (variant === "text") {
    const line = formatInvoiceVisitMetaTextLine(source);
    if (!line) return null;
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>{line}</p>
    );
  }

  const { dateLabel, timeLabel, locationLabel, isTelehealth } =
    resolveInvoiceVisitMetaIcons(source);
  const typeName = resolveAppointmentTypeDisplayName(source);
  const typeDurationLabel = formatAppointmentTypeDurationLabel(
    resolveAppointmentTypeDurationMinutes(source)
  );

  if (!dateLabel && !timeLabel && !locationLabel && !isTelehealth && !typeName) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-0.5",
        className
      )}
    >
      {dateLabel ? (
        <AppointmentCardMetaRow icon={<Calendar className="h-3.5 w-3.5" />}>
          {dateLabel}
        </AppointmentCardMetaRow>
      ) : null}
      {timeLabel ? (
        <AppointmentCardMetaRow icon={<Clock3 className="h-3.5 w-3.5" />}>
          <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span>{timeLabel}</span>
            {typeName ? (
              <AppointmentTypeGlassBadge
                name={typeName}
                durationLabel={typeDurationLabel}
                className="shrink-0"
              />
            ) : null}
            {isTelehealth ? <TelehealthSessionBadge /> : null}
          </span>
        </AppointmentCardMetaRow>
      ) : (
        <>
          {typeName ? (
            <AppointmentTypeGlassBadge
              name={typeName}
              durationLabel={typeDurationLabel}
              className="shrink-0"
            />
          ) : null}
          {!timeLabel && isTelehealth ? <TelehealthSessionBadge /> : null}
        </>
      )}
      {locationLabel ? (
        <AppointmentCardMetaRow icon={<MapPin className="h-3.5 w-3.5" />}>
          <span className="truncate">{locationLabel}</span>
        </AppointmentCardMetaRow>
      ) : null}
    </div>
  );
}
