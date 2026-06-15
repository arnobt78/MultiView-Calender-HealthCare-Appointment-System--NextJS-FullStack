"use client";

import { format, isToday } from "date-fns";
import { Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { AppointmentStatusGlassBadge } from "@/components/shared/appointments/AppointmentStatusGlassBadge";
import { DashboardAppointmentScheduleMetaRow } from "@/components/control-panel/dashboard/DashboardAppointmentScheduleMetaRow";
import { DashboardPatientIdentityInline } from "@/components/control-panel/dashboard/DashboardPatientIdentityInline";
import { TelehealthQueueDoctorCategoryBlock } from "@/components/control-panel/telehealth/TelehealthQueueDoctorCategoryBlock";
import { appointmentDetailHref } from "@/lib/entity-routes";
import {
  isRedundantTelehealthVisitTypeLabel,
  mapTelehealthQueueCategory,
  mapTelehealthQueuePatient,
  mapTelehealthQueueTreatingDoctor,
  resolveTelehealthQueuePhysicalLocation,
  resolveTelehealthVisitTypeLabel,
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
  onJoin: () => void;
};

/** Single telehealth queue row — status after title, full date, doctor + category. */
export function TelehealthQueueRow({ appointment, doctors, onJoin }: Props) {
  const inProgress = isTelehealthSessionInProgress(appointment);
  const ended = isTelehealthSessionEnded(appointment);
  const patient = mapTelehealthQueuePatient(appointment);
  const doctor = mapTelehealthQueueTreatingDoctor(appointment, doctors);
  const category = mapTelehealthQueueCategory(appointment);
  const detailHref = appointmentDetailHref("admin", appointment.id);
  const visitType = resolveTelehealthVisitTypeLabel(appointment);
  const physicalLocation = resolveTelehealthQueuePhysicalLocation(appointment);
  const showVisitTypeBadge = !isRedundantTelehealthVisitTypeLabel(visitType);

  return (
    <div
      className={cn(
        telehealthQueueListRowClass,
        inProgress && telehealthQueueListRowActiveClass,
        ended && telehealthQueueListRowMutedClass
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-16 shrink-0 pt-0.5 text-center">
          <p className={cn("text-lg font-bold leading-tight", inProgress && "text-violet-800")}>
            {format(new Date(appointment.start), "h:mm")}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {format(new Date(appointment.start), "a")}
          </p>
          {!isToday(new Date(appointment.start)) ? (
            <p className="mt-1 text-[10px] font-medium text-muted-foreground">
              {format(new Date(appointment.start), "MMM d")}
            </p>
          ) : null}
        </div>
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
            <AppointmentStatusGlassBadge status={appointment.status} size="compact" />
          </div>
          {showVisitTypeBadge ? (
            <Badge variant="outline" className="w-fit text-[10px] text-gray-700">
              {visitType}
            </Badge>
          ) : null}
          <DashboardAppointmentScheduleMetaRow
            start={appointment.start}
            end={appointment.end}
            location={physicalLocation}
            isTelehealth
            showTelehealthBadge={false}
            dateVariant="full"
          />
          {patient ? <DashboardPatientIdentityInline patient={patient} /> : null}
          {doctor || category ? (
            <TelehealthQueueDoctorCategoryBlock
              doctor={doctor}
              category={category}
              layout="inline"
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
