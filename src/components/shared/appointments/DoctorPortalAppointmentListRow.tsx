"use client";

import type { ReactNode } from "react";
import { format, isPast, parseISO } from "date-fns";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { AppointmentDateTag } from "@/components/shared/AppointmentDateTag";
import { AppointmentScheduleColorDot } from "@/components/shared/appointments/AppointmentScheduleColorDot";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { AppointmentListVisitFeeBadge } from "@/components/shared/appointment-display/AppointmentListVisitFeeBadge";
import { resolveAppointmentLineColor } from "@/context/AppointmentColorContext";
import { resolveAppointmentDisplayLocation } from "@/lib/appointment-visit-location";
import type { DoctorPortalAppointmentRow } from "@/types/types";
import {
  CalendarCheck,
  CalendarClock,
  CalendarX,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_META: Record<string, { cls: string; icon: ReactNode; label: string }> = {
  done: {
    cls: "calendar-glass-badge calendar-glass-badge-emerald",
    icon: <CalendarCheck className="h-3 w-3" aria-hidden />,
    label: "Done",
  },
  pending: {
    cls: "calendar-glass-badge calendar-glass-badge-amber",
    icon: <CalendarClock className="h-3 w-3" aria-hidden />,
    label: "Pending",
  },
  alert: {
    cls: "calendar-glass-badge calendar-glass-badge-rose",
    icon: <CalendarX className="h-3 w-3" aria-hidden />,
    label: "Alert",
  },
};

type DoctorPortalAppointmentListRowProps = {
  appt: DoctorPortalAppointmentRow;
  /** Today panel shows status + overdue; upcoming shows Today/Tomorrow/Later glass tag. */
  variant: "today" | "upcoming";
};

export function DoctorPortalAppointmentListRow({
  appt,
  variant,
}: DoctorPortalAppointmentListRowProps) {
  const start = parseISO(appt.start);
  const end = parseISO(appt.end);
  const lineColor = resolveAppointmentLineColor(appt.id);
  const statusKey = appt.status ?? "pending";
  const meta = STATUS_META[statusKey] ?? STATUS_META.pending;
  const overdue = isPast(end) && appt.status !== "done";
  const locationLabel = resolveAppointmentDisplayLocation(appt);

  return (
    <div className="flex items-start gap-2 border-b border-border/40 py-3 last:border-0">
      <div
        className={cn(
          "shrink-0 text-right",
          variant === "today" ? "w-16" : "w-20"
        )}
      >
        {variant === "upcoming" ? (
          <>
            <p className="text-[10px] font-medium text-muted-foreground">
              {format(start, "EEE, MMM d")}
            </p>
            <p className="text-xs font-semibold text-foreground">{format(start, "HH:mm")}</p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold text-foreground">{format(start, "HH:mm")}</p>
            <p className="text-[10px] text-muted-foreground">{format(end, "HH:mm")}</p>
          </>
        )}
      </div>
      <AppointmentScheduleColorDot color={lineColor} />
      <div className="min-w-0 flex-1">
        <RoleEntityLink
          kind="appointment"
          id={appt.id}
          label={appt.title}
          className="block truncate text-sm font-medium"
        />
        {locationLabel ? (
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            {locationLabel}
          </p>
        ) : null}
        {appt.chief_complaint ? (
          <p className="truncate text-[11px] text-muted-foreground">{appt.chief_complaint}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {variant === "upcoming" ? (
          <AppointmentDateTag date={start} className="text-[10px]" />
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-normal",
              meta.cls
            )}
          >
            {meta.icon}
            {meta.label}
          </span>
        )}
        {appt.is_telehealth ? <TelehealthSessionBadge /> : null}
        {variant === "today" && overdue ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-red-200/60 bg-red-100/80 px-2 py-0.5 text-[10px] font-normal text-red-700">
            <AlertCircle className="h-3 w-3" aria-hidden />
            Overdue
          </span>
        ) : null}
        <AppointmentListVisitFeeBadge
          appointmentTypePriceCents={appt.appointment_type_price_cents}
          doctorConsultationFeeCents={appt.doctor_consultation_fee_cents}
        />
      </div>
    </div>
  );
}
