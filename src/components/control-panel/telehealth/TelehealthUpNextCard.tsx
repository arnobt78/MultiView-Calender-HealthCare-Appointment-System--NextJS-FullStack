"use client";

import { format } from "date-fns";
import { Clock, FileText, Timer, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { AppointmentStatusGlassBadge } from "@/components/shared/appointments/AppointmentStatusGlassBadge";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { DashboardPatientIdentityInline } from "@/components/control-panel/dashboard/DashboardPatientIdentityInline";
import { DashboardAppointmentScheduleMetaRow } from "@/components/control-panel/dashboard/DashboardAppointmentScheduleMetaRow";
import { TelehealthQueueDoctorCategoryBlock } from "@/components/control-panel/telehealth/TelehealthQueueDoctorCategoryBlock";
import { appointmentDetailHref } from "@/lib/entity-routes";
import {
  isRedundantTelehealthVisitTypeLabel,
  mapTelehealthQueueCategory,
  mapTelehealthQueuePatient,
  mapTelehealthQueueTreatingDoctor,
  resolveTelehealthDurationMinutes,
  resolveTelehealthQueuePhysicalLocation,
  resolveTelehealthVisitTypeLabel,
} from "@/lib/telehealth-queue-display";
import {
  telehealthQueueHeaderChipClass,
  telehealthQueueJoinButtonClass,
  telehealthQueueTelehealthHeaderBadgeClass,
  telehealthQueueTimeBadgeClass,
  telehealthQueueUpNextCardClass,
} from "@/lib/telehealth-queue-ui-classes";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import type { FullAppointment } from "@/hooks/useAppointments";

type Props = {
  appointment: FullAppointment;
  doctors?: DoctorDirectoryRow[] | null;
  onJoin: () => void;
};

/** Violet glass hero — clock + status header, doctor + category, glass Join. */
export function TelehealthUpNextCard({ appointment, doctors, onJoin }: Props) {
  const patient = mapTelehealthQueuePatient(appointment);
  const doctor = mapTelehealthQueueTreatingDoctor(appointment, doctors);
  const category = mapTelehealthQueueCategory(appointment);
  const detailHref = appointmentDetailHref("admin", appointment.id);
  const visitType = resolveTelehealthVisitTypeLabel(appointment);
  const duration = resolveTelehealthDurationMinutes(appointment);
  const physicalLocation = resolveTelehealthQueuePhysicalLocation(appointment);
  const showVisitTypeBadge = !isRedundantTelehealthVisitTypeLabel(visitType);

  return (
    <Card className={telehealthQueueUpNextCardClass}>
      <CardContent className="pt-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={telehealthQueueTimeBadgeClass}>
              <Clock className="shrink-0" aria-hidden />
              {format(new Date(appointment.start), "h:mm a")}
            </Badge>
            <AppointmentStatusGlassBadge
              status={appointment.status}
              size="compact"
              className={telehealthQueueHeaderChipClass}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TelehealthSessionBadge className={telehealthQueueTelehealthHeaderBadgeClass} />
            {showVisitTypeBadge ? (
              <Badge variant="outline" className="text-xs text-gray-700">
                {visitType}
              </Badge>
            ) : null}
          </div>
        </div>
        <EntityTitleLink
          href={detailHref}
          label={appointment.title}
          className="block text-sm font-medium"
        />
        <DashboardAppointmentScheduleMetaRow
          start={appointment.start}
          end={appointment.end}
          location={physicalLocation}
          isTelehealth
          showTelehealthBadge={false}
          dateVariant="full"
        />
        {patient ? (
          <div className="mt-2">
            <DashboardPatientIdentityInline patient={patient} />
          </div>
        ) : null}
        {doctor || category ? (
          <div className="mt-2">
            <TelehealthQueueDoctorCategoryBlock doctor={doctor} category={category} />
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
              <FileText className="size-4 shrink-0" aria-hidden />
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
