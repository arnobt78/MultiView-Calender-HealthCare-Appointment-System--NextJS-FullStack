"use client";

import type { ReactNode } from "react";

/**
 * Compact patient-portal timeline card — previous horizontal meta layout (not full dashboard list card).
 * Reuses shared color bar tokens, `PortalClinicianLink`, `CategoryInlineLink`, status glass badges.
 */

import { format, isToday } from "date-fns";
import {
  Calendar,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Clock3,
  FileText,
  NotebookPen,
  Stethoscope,
} from "lucide-react";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { AppointmentVisitScheduleMeta } from "@/components/shared/appointments/AppointmentVisitScheduleMeta";
import { Badge } from "@/components/ui/badge";
import { AppointmentCardMetaRow } from "@/components/shared/AppointmentCardMetaRow";
import { AppointmentListColorBar } from "@/components/shared/AppointmentListColorBar";
import { AppointmentCategoryTypeMetaRow } from "@/components/shared/appointment-display/AppointmentCategoryTypeMetaRow";
import { shouldShowAppointmentCategoryTypeRow } from "@/lib/appointment-type-display";
import { resolveDisplayedVisitFeeCents } from "@/lib/appointment-visit-fee-display";
import { PortalAppointmentClinicianIdentityBlock } from "@/components/shared/portal-appointment/PortalAppointmentClinicianIdentityBlock";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { resolvePortalTreatingClinician } from "@/lib/portal-appointment-clinician";
import { canShowAppointmentClinicalNotes } from "@/lib/portal-appointment-card-visibility";
import { useAppointmentColor } from "@/context/AppointmentColorContext";
import { useAuth } from "@/hooks/useAuth";
import { portalAppointmentDetailStackClass } from "@/lib/appointment-card";
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
  /** Override notes visibility — default: admin/doctor only (hidden on patient portal). */
  showClinicalNotes?: boolean;
};

export function PortalAppointmentTimelineCard({
  appointment: appt,
  className,
  showClinicalNotes,
}: PortalAppointmentTimelineCardProps) {
  const { user } = useAuth();
  const showNotes =
    showClinicalNotes ?? canShowAppointmentClinicalNotes(user?.role ?? null);

  // Seed-only tint (appointment.id) — same rule as dashboard list cards; category hex is for swatch links only.
  const { getAppointmentColorToken } = useAppointmentColor();
  const colorToken = getAppointmentColorToken(appt.id, null);
  const status = appt.status ?? "pending";
  const statusMeta = STATUS_GLASS[status] ?? STATUS_GLASS.pending;
  const startDate = new Date(appt.start);
  const treatingClinician = resolvePortalTreatingClinician(appt);
  const displayFeeCents = resolveDisplayedVisitFeeCents({
    typePriceCents: appt.appointment_type_price_cents,
    doctorConsultationFeeCents: appt.doctor_consultation_fee_cents,
  });
  const showCategoryTypeRow =
    Boolean(appt.category_data) || shouldShowAppointmentCategoryTypeRow(appt, displayFeeCents);

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
              {appt.is_telehealth ? <TelehealthSessionBadge /> : null}
            </div>

            <AppointmentVisitScheduleMeta
              dateTimeLabel={
                <>
                  {format(startDate, "dd MMM yyyy, HH:mm")}
                  {" — "}
                  {format(new Date(appt.end), "HH:mm")}
                </>
              }
              location={appt.location}
              office_location={
                appt.treating_physician?.office_location ?? appt.owner?.office_location
              }
              is_telehealth={appt.is_telehealth}
            />

            <div className={portalAppointmentDetailStackClass}>
              {appt.owner ? (
                <PortalAppointmentClinicianIdentityBlock
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="Calendar owner"
                  clinician={appt.owner}
                />
              ) : null}

              {treatingClinician ? (
                <PortalAppointmentClinicianIdentityBlock
                  icon={<Stethoscope className="h-3.5 w-3.5" />}
                  label="Treating physician"
                  clinician={treatingClinician}
                />
              ) : null}

              {showCategoryTypeRow ? (
                <AppointmentCategoryTypeMetaRow
                  category={
                    appt.category_data
                      ? {
                          categoryId: appt.category_data.id,
                          label: appt.category_data.label,
                          color: appt.category_data.color,
                          icon: appt.category_data.icon,
                        }
                      : null
                  }
                  appointment={appt}
                  displayFeeCents={displayFeeCents}
                  showFeeEstimateHint
                />
              ) : null}
            </div>

            {appt.chief_complaint?.trim() ? (
              <AppointmentCardMetaRow
                icon={<NotebookPen className="h-3.5 w-3.5" />}
                label="Chief complaint:"
                wrap
                className="flex w-full min-w-0 items-center"
              >
                <span className="font-medium text-gray-700">{appt.chief_complaint.trim()}</span>
              </AppointmentCardMetaRow>
            ) : null}

            {showNotes && appt.notes?.trim() ? (
              <AppointmentCardMetaRow
                icon={<FileText className="h-3.5 w-3.5" />}
                label="Notes:"
                wrap
                className="flex w-full min-w-0 items-center"
              >
                <span className="font-medium text-gray-700">{appt.notes.trim()}</span>
              </AppointmentCardMetaRow>
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
