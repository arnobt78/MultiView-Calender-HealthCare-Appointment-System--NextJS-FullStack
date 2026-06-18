"use client";

import { Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { AppointmentVisitMetaBadgeRow } from "@/components/shared/appointment-display/AppointmentVisitMetaBadgeRow";
import { TelehealthQueueListTimeColumn } from "@/components/control-panel/telehealth/TelehealthQueueListTimeColumn";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { DashboardAppointmentScheduleMetaRow } from "@/components/control-panel/dashboard/DashboardAppointmentScheduleMetaRow";
import { DashboardPatientIdentityInline } from "@/components/control-panel/dashboard/DashboardPatientIdentityInline";
import { TelehealthQueueDoctorCategoryBlock } from "@/components/control-panel/telehealth/TelehealthQueueDoctorCategoryBlock";
import { appointmentDetailHref, type EntityRole } from "@/lib/entity-routes";
import { isPatientRole } from "@/lib/rbac";
import type { AppointmentVisitMetaBilling } from "@/lib/appointment-visit-meta-resolve";
import {
  resolveAppointmentVisitMetaFromFullAppointmentTelehealth,
} from "@/lib/appointment-visit-meta-resolve";
import {
  mapTelehealthQueueCategory,
  mapTelehealthQueuePatient,
  mapTelehealthQueueTreatingDoctor,
  resolveTelehealthQueuePhysicalLocation,
} from "@/lib/telehealth-queue-display";
import {
  isTelehealthSessionEnded,
  isTelehealthSessionInProgress,
} from "@/lib/telehealth-queue-filter";
import {
  telehealthQueueJoinButtonSmClass,
  telehealthQueueListRowActiveClass,
  telehealthQueueListRowClass,
  telehealthQueueListRowMutedClass,
} from "@/lib/telehealth-queue-ui-classes";
import { controlPanelDashboardQueueItemStackClass } from "@/lib/control-panel-glass-card";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import type { FullAppointment } from "@/hooks/useAppointments";
import { cn } from "@/lib/utils";

type Props = {
  appointment: FullAppointment;
  doctors?: DoctorDirectoryRow[] | null;
  billing?: AppointmentVisitMetaBilling;
  billingBadgesLoading?: boolean;
  onJoin: () => void;
  viewerRole?: EntityRole;
};

/**
 * Single telehealth queue row — tonal left clock + glass meta chips (duration · status · fee · billing · telehealth).
 */
export function TelehealthQueueRow({
  appointment,
  doctors,
  billing,
  billingBadgesLoading = false,
  onJoin,
  viewerRole = "admin",
}: Props) {
  const inProgress = isTelehealthSessionInProgress(appointment);
  const ended = isTelehealthSessionEnded(appointment);
  const patient = mapTelehealthQueuePatient(appointment);
  const doctor = mapTelehealthQueueTreatingDoctor(appointment, doctors);
  const category = mapTelehealthQueueCategory(appointment);
  const detailHref = appointmentDetailHref(viewerRole, appointment.id);
  const patientViewer = isPatientRole(viewerRole);
  const physicalLocation = resolveTelehealthQueuePhysicalLocation(appointment);

  const meta = resolveAppointmentVisitMetaFromFullAppointmentTelehealth(appointment);

  return (
    <div
      className={cn(
        telehealthQueueListRowClass,
        inProgress && telehealthQueueListRowActiveClass,
        ended && telehealthQueueListRowMutedClass
      )}
    >
      <div className="flex items-start gap-3">
        <TelehealthQueueListTimeColumn
          start={appointment.start}
          inProgress={inProgress}
          ended={ended}
        />
        <div
          className={cn(
            "mt-1 h-12 w-1 shrink-0 rounded-full",
            appointment.status === "done"
              ? "bg-emerald-500"
              : inProgress
                ? "animate-pulse bg-violet-500"
                : "bg-violet-200"
          )}
        />
        <div className={cn("min-w-0 flex-1", controlPanelDashboardQueueItemStackClass)}>
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <EntityTitleLink
              href={detailHref}
              label={appointment.title}
              className="min-w-0 text-sm font-semibold"
              wrapLabel={false}
            />
            {inProgress ? (
              <Badge className="h-5 border-violet-300 bg-violet-100 px-1.5 text-[10px] text-violet-800">
                NOW
              </Badge>
            ) : null}
          </div>
          <AppointmentVisitMetaBadgeRow
            layout="queueListHero"
            appointmentTypeName={meta.appointmentTypeName}
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
          <DashboardAppointmentScheduleMetaRow
            start={appointment.start}
            end={appointment.end}
            location={physicalLocation}
            isTelehealth
            showTelehealthBadge={false}
            dateVariant="full"
          />
          {patient && !patientViewer ? (
            <DashboardPatientIdentityInline patient={patient} viewerRole={viewerRole} />
          ) : null}
          {doctor || category ? (
            <TelehealthQueueDoctorCategoryBlock
              doctor={doctor}
              category={category}
              layout="inline"
              viewerRole={viewerRole}
            />
          ) : null}
        </div>
        <div className="flex shrink-0 pt-0.5">
          {!ended ? (
            <ControlPanelGlassActionButton
              type="button"
              variant="violet"
              className={telehealthQueueJoinButtonSmClass}
              onClick={onJoin}
            >
              <Video className="h-4 w-4 shrink-0" aria-hidden />
              <span className="hidden md:inline">Join</span>
            </ControlPanelGlassActionButton>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Ended
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
