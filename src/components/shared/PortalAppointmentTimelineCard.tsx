"use client";

import type { ReactNode } from "react";

/**
 * Compact patient-portal timeline card — previous horizontal meta layout (not full dashboard list card).
 * Reuses shared color bar tokens, `PortalStaffLink`, `CategoryInlineLink`, status glass badges.
 */

import { format, isToday } from "date-fns";
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Clock3,
  Euro,
  FileText,
  MapPin,
  Stethoscope,
  Tags,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AppointmentCardMetaRow } from "@/components/shared/AppointmentCardMetaRow";
import { AppointmentListColorBar } from "@/components/shared/AppointmentListColorBar";
import { CategoryInlineLink } from "@/components/shared/CategoryInlineLink";
import { PortalStaffLink } from "@/components/shared/PortalStaffLink";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { useAppointmentColor } from "@/context/AppointmentColorContext";
import { appointmentCardMetaGroupClass } from "@/lib/appointment-card";
import {
  portalOwnerDisplayLabel,
  portalTreatingDisplayLabel,
} from "@/lib/portal-appointment";
import type { PortalAppointmentRow } from "@/lib/serializers";
import { cn } from "@/lib/utils";

const STATUS_GLASS: Record<string, { icon: ReactNode; glassCls: string; label: string }> = {
  done: {
    icon: <CalendarCheck className="h-3.5 w-3.5" />,
    glassCls: "calendar-glass-badge-emerald",
    label: "Done",
  },
  pending: {
    icon: <CalendarClock className="h-3.5 w-3.5" />,
    glassCls: "calendar-glass-badge-amber",
    label: "Pending",
  },
  alert: {
    icon: <CalendarX className="h-3.5 w-3.5" />,
    glassCls: "calendar-glass-badge-rose",
    label: "Alert",
  },
};

export type PortalAppointmentTimelineCardProps = {
  appointment: PortalAppointmentRow;
  className?: string;
};

export function PortalAppointmentTimelineCard({
  appointment: appt,
  className,
}: PortalAppointmentTimelineCardProps) {
  // Seed-only tint (appointment.id) — same rule as dashboard list cards; category hex is for swatch links only.
  const { getAppointmentColorToken } = useAppointmentColor();
  const colorToken = getAppointmentColorToken(appt.id, null);
  const status = appt.status ?? "pending";
  const statusMeta = STATUS_GLASS[status] ?? STATUS_GLASS.pending;
  const startDate = new Date(appt.start);
  const treatingDiffers =
    Boolean(appt.treating_physician_id) && appt.treating_physician_id !== appt.user_id;

  return (
    <div
      className={cn(
        "relative flex min-h-[100px] items-stretch overflow-hidden rounded-2xl border shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl",
        className
      )}
      style={{
        backgroundColor: colorToken.cardBgColor,
        borderColor: colorToken.cardBorderColor,
      }}
    >
      <AppointmentListColorBar color={colorToken.lineColor} />
      <div className="flex min-w-0 flex-1 flex-col gap-1 p-4 pl-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <RoleEntityLink
                kind="appointment"
                id={appt.id}
                label={appt.title}
                className="text-sm font-semibold"
              />
              <Badge
                variant="outline"
                className={cn("calendar-glass-badge gap-1 text-xs", statusMeta.glassCls)}
              >
                {statusMeta.icon}
                <span className="ml-1">{statusMeta.label}</span>
              </Badge>
              {appt.is_telehealth ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-200/60 bg-sky-100/80 px-2 py-0.5 text-[10px] font-medium text-sky-700">
                  <Video className="h-3 w-3" aria-hidden />
                  Telehealth
                </span>
              ) : null}
              {/* Visit fee badge — sourced from appointment_type.price_cents via serializeAppointment */}
              {(appt.appointment_type_price_cents ?? 0) > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/70 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
                  <Euro className="h-3 w-3" aria-hidden />
                  {((appt.appointment_type_price_cents ?? 0) / 100).toFixed(2)}
                  <span className="ml-0.5 text-[9px] font-normal text-emerald-500/90">· est.</span>
                </span>
              ) : null}
            </div>

            <div className={appointmentCardMetaGroupClass}>
              <AppointmentCardMetaRow icon={<Clock3 className="h-3.5 w-3.5" />}>
                <span className="font-medium text-gray-700">
                  {format(startDate, "dd MMM yyyy, HH:mm")}
                  {" — "}
                  {format(new Date(appt.end), "HH:mm")}
                </span>
              </AppointmentCardMetaRow>

              {appt.location ? (
                <AppointmentCardMetaRow icon={<MapPin className="h-3.5 w-3.5" />}>
                  <span className="font-medium text-gray-700">{appt.location}</span>
                </AppointmentCardMetaRow>
              ) : null}

              {appt.owner ? (
                <AppointmentCardMetaRow icon={<Calendar className="h-3.5 w-3.5" />} label="Calendar owner:">
                  <PortalStaffLink
                    staffUserId={appt.owner.id}
                    staffRole={appt.owner.role}
                    label={portalOwnerDisplayLabel(appt.owner)}
                  />
                </AppointmentCardMetaRow>
              ) : null}

              {treatingDiffers && appt.treating_physician ? (
                <AppointmentCardMetaRow icon={<Stethoscope className="h-3.5 w-3.5" />} label="Treating physician:">
                  <PortalStaffLink
                    staffUserId={appt.treating_physician.id}
                    staffRole={appt.treating_physician.role}
                    label={portalTreatingDisplayLabel(appt.treating_physician)}
                  />
                </AppointmentCardMetaRow>
              ) : null}

              {appt.category_data ? (
                <AppointmentCardMetaRow icon={<Tags className="h-3.5 w-3.5" />} label="Category:">
                  <CategoryInlineLink
                    categoryId={appt.category_data.id}
                    label={appt.category_data.label}
                    color={appt.category_data.color}
                    icon={appt.category_data.icon}
                  />
                </AppointmentCardMetaRow>
              ) : null}
            </div>

            {appt.notes ? (
              <p className="flex items-start gap-1 text-xs text-gray-600">
                <FileText className="h-3 w-3 shrink-0 text-gray-500" aria-hidden />
                {appt.notes}
              </p>
            ) : null}
          </div>

          <p className="shrink-0 text-xs font-medium text-gray-500">
            {isToday(startDate) ? "Today" : format(startDate, "EEE, dd MMM")}
          </p>
        </div>
      </div>
    </div>
  );
}
