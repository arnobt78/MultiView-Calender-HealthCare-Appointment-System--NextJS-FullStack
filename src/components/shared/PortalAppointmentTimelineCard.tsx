"use client";

import { format } from "date-fns";
import {
  Calendar,
  Clock3,
  FileText,
  NotebookPen,
  Stethoscope,
} from "lucide-react";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { AppointmentStatusGlassBadge } from "@/components/shared/appointments/AppointmentStatusGlassBadge";
import { AppointmentVisitScheduleMeta } from "@/components/shared/appointments/AppointmentVisitScheduleMeta";
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
import type { InvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import { cn } from "@/lib/utils";

export type PortalAppointmentTimelineCardProps = {
  appointment: PortalAppointmentRow;
  className?: string;
  /** Override notes visibility — default: admin/doctor only (hidden on patient portal). */
  showClinicalNotes?: boolean;
  invoiceDisplayStatus?: InvoiceDisplayStatus | null;
};

export function PortalAppointmentTimelineCard({
  appointment: appt,
  className,
  showClinicalNotes,
  invoiceDisplayStatus,
}: PortalAppointmentTimelineCardProps) {
  const { user } = useAuth();
  const showNotes =
    showClinicalNotes ?? canShowAppointmentClinicalNotes(user?.role ?? null);

  const { getAppointmentColorToken } = useAppointmentColor();
  const colorToken = getAppointmentColorToken(appt.id, null);
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
        appt.status === "cancelled" && "opacity-75 border-slate-200/80 bg-slate-50/40",
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
              <AppointmentStatusGlassBadge status={appt.status} size="compact" />
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
                  showFeeEstimateHint={!invoiceDisplayStatus}
                  invoiceDisplayStatus={invoiceDisplayStatus}
                />
              ) : null}

              {appt.chief_complaint ? (
                <AppointmentCardMetaRow icon={<Stethoscope className="h-3.5 w-3.5" />} label="Chief complaint:">
                  {appt.chief_complaint}
                </AppointmentCardMetaRow>
              ) : null}

              {showNotes && appt.notes ? (
                <AppointmentCardMetaRow icon={<NotebookPen className="h-3.5 w-3.5" />} label="Notes:">
                  {appt.notes}
                </AppointmentCardMetaRow>
              ) : null}

              {appt.attachments?.length ? (
                <AppointmentCardMetaRow icon={<FileText className="h-3.5 w-3.5" />} label="Attachments:">
                  {appt.attachments.length} file{appt.attachments.length !== 1 ? "s" : ""}
                </AppointmentCardMetaRow>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
