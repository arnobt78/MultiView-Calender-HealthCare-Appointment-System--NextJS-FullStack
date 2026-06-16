"use client";

import { format } from "date-fns";
import { Clock, FileText, Timer, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { AppointmentVisitMetaBadgeRow } from "@/components/shared/appointment-display/AppointmentVisitMetaBadgeRow";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { DashboardPatientIdentityInline } from "@/components/control-panel/dashboard/DashboardPatientIdentityInline";
import { DashboardAppointmentScheduleMetaRow } from "@/components/control-panel/dashboard/DashboardAppointmentScheduleMetaRow";
import { TelehealthQueueDoctorCategoryBlock } from "@/components/control-panel/telehealth/TelehealthQueueDoctorCategoryBlock";
import { appointmentDetailHref, type EntityRole } from "@/lib/entity-routes";
import { isPatientRole } from "@/lib/rbac";
import type { AppointmentVisitMetaBilling } from "@/lib/appointment-visit-meta-resolve";
import {
  resolveAppointmentVisitMetaFromFullAppointmentTelehealth,
} from "@/lib/appointment-visit-meta-resolve";
import {
  isRedundantTelehealthVisitTypeLabel,
  mapTelehealthQueueCategory,
  mapTelehealthQueuePatient,
  mapTelehealthQueueTreatingDoctor,
  resolveTelehealthDurationMinutes,
  resolveTelehealthQueuePhysicalLocation,
} from "@/lib/telehealth-queue-display";
import {
  telehealthQueueJoinButtonClass,
  telehealthQueueTimeBadgeClass,
  telehealthQueueUpNextCardClass,
} from "@/lib/telehealth-queue-ui-classes";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import type { FullAppointment } from "@/hooks/useAppointments";

type Props = {
  appointment: FullAppointment;
  doctors?: DoctorDirectoryRow[] | null;
  billing?: AppointmentVisitMetaBilling;
  billingBadgesLoading?: boolean;
  onJoin: () => void;
  viewerRole?: EntityRole;
};

/**
 * Violet glass hero — clock anchor + shared visit-meta chips, patient (non-patient viewer),
 * doctor + category inline, glass Join.
 */
export function TelehealthUpNextCard({
  appointment,
  doctors,
  billing,
  billingBadgesLoading = false,
  onJoin,
  viewerRole = "admin",
}: Props) {
  const patient = mapTelehealthQueuePatient(appointment);
  const doctor = mapTelehealthQueueTreatingDoctor(appointment, doctors);
  const category = mapTelehealthQueueCategory(appointment);
  const detailHref = appointmentDetailHref(viewerRole, appointment.id);
  const patientViewer = isPatientRole(viewerRole);
  const duration = resolveTelehealthDurationMinutes(appointment);
  const physicalLocation = resolveTelehealthQueuePhysicalLocation(appointment);

  const meta = resolveAppointmentVisitMetaFromFullAppointmentTelehealth(appointment);
  const typeName =
    meta.appointmentTypeName &&
    !isRedundantTelehealthVisitTypeLabel(meta.appointmentTypeName)
      ? meta.appointmentTypeName
      : null;

  return (
    <Card className={telehealthQueueUpNextCardClass}>
      <CardContent className="pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={telehealthQueueTimeBadgeClass}>
            <Clock className="size-3 shrink-0" aria-hidden />
            {format(new Date(appointment.start), "h:mm a")}
          </span>
        </div>

        <EntityTitleLink
          href={detailHref}
          label={appointment.title}
          className="block text-sm font-medium"
        />

        <div className="mt-2">
          <AppointmentVisitMetaBadgeRow
            appointmentTypeName={typeName}
            durationMinutes={meta.durationMinutes}
            visitFeeCents={meta.visitFeeCents}
            showVisitFeeEstimateHint={meta.showVisitFeeEstimateHint}
            status={appointment.status}
            showTelehealthBadge
            invoiceDisplayStatus={billing?.invoiceDisplayStatus}
            showInvoiceBadge={billing?.showInvoice}
            paymentStatus={billing?.latestPayment?.status}
            showPaymentBadge={billing?.showPayment}
            billingBadgesLoading={billingBadgesLoading}
          />
        </div>

        <DashboardAppointmentScheduleMetaRow
          start={appointment.start}
          end={appointment.end}
          location={physicalLocation}
          isTelehealth
          showTelehealthBadge={false}
          dateVariant="full"
        />

        {patient && !patientViewer ? (
          <div className="mt-2">
            <DashboardPatientIdentityInline patient={patient} viewerRole={viewerRole} />
          </div>
        ) : null}

        {doctor || category ? (
          <div className="mt-2">
            <TelehealthQueueDoctorCategoryBlock
              doctor={doctor}
              category={category}
              layout="inline"
              viewerRole={viewerRole}
            />
          </div>
        ) : null}

        <Separator className="my-2" />

        <div className="mb-2 grid gap-2 text-xs text-muted-foreground">
          {duration > 0 ? (
            <div className="flex items-start gap-2">
              <Timer className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span>
                Duration: <span className="font-medium text-emerald-700">{duration} mins</span>
              </span>
            </div>
          ) : null}
          {appointment.chief_complaint?.trim() ? (
            <div className="flex items-start gap-2">
              <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="line-clamp-2">{appointment.chief_complaint}</span>
            </div>
          ) : appointment.notes?.trim() ? (
            <div className="flex items-start gap-2">
              <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="line-clamp-2">{appointment.notes}</span>
            </div>
          ) : null}
        </div>

        <ControlPanelGlassActionButton
          type="button"
          variant="violet"
          className={telehealthQueueJoinButtonClass}
          onClick={onJoin}
        >
          <Video className="h-5 w-5 shrink-0" aria-hidden />
          Join Video Room
        </ControlPanelGlassActionButton>
      </CardContent>
    </Card>
  );
}
