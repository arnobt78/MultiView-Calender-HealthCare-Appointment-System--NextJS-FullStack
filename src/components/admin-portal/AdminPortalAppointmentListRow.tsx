"use client";

import { format, isPast, parseISO } from "date-fns";
import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { AppointmentDateTag } from "@/components/shared/AppointmentDateTag";
import { AppointmentScheduleColorDot } from "@/components/shared/appointments/AppointmentScheduleColorDot";
import { AppointmentStatusGlassBadge } from "@/components/shared/appointments/AppointmentStatusGlassBadge";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { AppointmentListVisitFeeBadge } from "@/components/shared/appointment-display/AppointmentListVisitFeeBadge";
import { AppointmentTypeGlassBadge } from "@/components/shared/appointment-display/AppointmentTypeGlassBadge";
import { CategoryInlineLink } from "@/components/shared/CategoryInlineLink";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { DoctorIdentityRow } from "@/components/shared/doctor-display/DoctorIdentityRow";
import { UserAvatar } from "@/components/shared/UserAvatar";
import type { InvoiceDisplayStatus } from "@/lib/billing-appointment-eligibility";
import {
  formatAppointmentTypeDurationLabel,
  resolveAppointmentTypeDisplayName,
  resolveAppointmentTypeDurationMinutes,
} from "@/lib/appointment-type-display";
import { resolveAppointmentLineColor } from "@/context/AppointmentColorContext";
import { resolveAppointmentDisplayLocation } from "@/lib/appointment-visit-location";
import type { AdminPortalAppointmentRow } from "@/types/types";
import { AlertCircle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  appt: AdminPortalAppointmentRow;
  invoiceDisplayStatus?: InvoiceDisplayStatus | null;
};

/** Rich admin-portal appointment row — parity with doctor portal list + patient/clinician embeds. */
export function AdminPortalAppointmentListRow({ appt, invoiceDisplayStatus }: Props) {
  const start = parseISO(appt.start);
  const end = parseISO(appt.end);
  const lineColor = resolveAppointmentLineColor(appt.id);
  const overdue = isPast(end) && appt.status !== "done" && appt.status !== "cancelled";
  const locationLabel = resolveAppointmentDisplayLocation(appt);
  const typeName = resolveAppointmentTypeDisplayName(appt);
  const typeDurationLabel = formatAppointmentTypeDurationLabel(
    resolveAppointmentTypeDurationMinutes(appt)
  );
  const ownerId = appt.user_id;
  const treatingId = appt.treating_physician_id ?? ownerId;
  const ownerDiffersFromTreating = treatingId !== ownerId;

  return (
    <div className="flex items-start gap-2 border-b border-border/40 py-3 last:border-0">
      <div className="w-20 shrink-0 text-right">
        <p className="text-[10px] font-medium text-muted-foreground">{format(start, "EEE, MMM d")}</p>
        <p className="text-xs font-semibold text-foreground">{format(start, "HH:mm")}</p>
      </div>
      <AppointmentScheduleColorDot color={lineColor} />
      <div className="min-w-0 flex-1 space-y-1">
        <RoleEntityLink
          kind="appointment"
          id={appt.id}
          label={appt.title}
          className="block truncate text-sm font-medium"
        />
        {typeName ? (
          <div className="flex flex-wrap items-center gap-1">
            <AppointmentTypeGlassBadge
              name={typeName}
              durationLabel={typeDurationLabel}
              className="shrink-0"
            />
          </div>
        ) : null}
        {appt.category_data?.label ? (
          <CategoryInlineLink
            categoryId={appt.category_data.id}
            label={appt.category_data.label}
            color={appt.category_data.color}
            icon={appt.category_data.icon}
            className="text-[11px]"
          />
        ) : null}
        {locationLabel ? (
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" aria-hidden />
            {locationLabel}
          </p>
        ) : null}
        {appt.patient_name && appt.patient ? (
          <div className="flex min-w-0 items-center gap-2">
            <UserAvatar
              src={appt.patient_image}
              alt={appt.patient_name}
              fallbackText={appt.patient_name.slice(0, 2)}
              sizeClassName="h-7 w-7"
              className="shrink-0"
            />
            <div className="min-w-0">
              <RoleEntityLink
                kind="patient"
                id={appt.patient}
                label={appt.patient_name}
                className="block truncate text-xs font-medium"
              />
              {appt.patient_email ? (
                <p className="truncate text-[10px] text-muted-foreground">{appt.patient_email}</p>
              ) : null}
            </div>
          </div>
        ) : null}
        {appt.owner_clinician ? (
          <div className="space-y-0.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Calendar owner
            </p>
            <DoctorIdentityRow
              doctor={appt.owner_clinician}
              linkKind="role"
              viewerRole="admin"
              size="sm"
              layout="compactStack"
              showRoleBadge
              staffRole={appt.owner_clinician.role}
            />
          </div>
        ) : null}
        {ownerDiffersFromTreating && appt.treating_clinician ? (
          <div className="space-y-0.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Treating physician
            </p>
            <DoctorIdentityRow
              doctor={appt.treating_clinician}
              linkKind="role"
              viewerRole="admin"
              size="sm"
              layout="compactStack"
              showRoleBadge
              staffRole={appt.treating_clinician.role}
            />
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <AppointmentDateTag date={start} className="text-[10px]" />
        <AppointmentStatusGlassBadge status={appt.status} size="compact" />
        {invoiceDisplayStatus ? (
          <InvoiceStatusBadge displayStatus={invoiceDisplayStatus} />
        ) : null}
        {appt.is_telehealth ? <TelehealthSessionBadge /> : null}
        {overdue ? (
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
