"use client";

import { Calendar, Clock3, MapPin } from "lucide-react";
import { AppointmentCardMetaRow } from "@/components/shared/AppointmentCardMetaRow";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import type { InvoiceVisitSummary } from "@/lib/billing-types";
import {
  formatInvoiceVisitDateLabel,
  formatInvoiceVisitTimeRange,
  resolveInvoiceLocationDisplay,
} from "@/lib/invoice-list-row-display";
import { cn } from "@/lib/utils";

type Props = {
  summary: InvoiceVisitSummary;
  className?: string;
};

/** Visit date, time, location, telehealth — category omitted on doctor portal billing list. */
export function InvoiceVisitListMeta({ summary, className }: Props) {
  const dateLabel = formatInvoiceVisitDateLabel(summary.start_iso);
  const timeLabel = formatInvoiceVisitTimeRange(summary.start_iso, summary.end_iso);
  const locationLabel = resolveInvoiceLocationDisplay(summary);

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
          {timeLabel}
        </AppointmentCardMetaRow>
      ) : null}
      {locationLabel ? (
        <AppointmentCardMetaRow icon={<MapPin className="h-3.5 w-3.5" />}>
          <span className="truncate">{locationLabel}</span>
        </AppointmentCardMetaRow>
      ) : null}
      {summary.is_telehealth ? <TelehealthSessionBadge /> : null}
    </div>
  );
}
