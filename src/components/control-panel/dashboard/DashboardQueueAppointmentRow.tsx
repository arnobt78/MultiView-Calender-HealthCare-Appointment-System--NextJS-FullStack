"use client";

import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { Clock } from "lucide-react";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { DashboardAppointmentScheduleMetaRow } from "@/components/control-panel/dashboard/DashboardAppointmentScheduleMetaRow";
import { DashboardAppointmentStatusBadge } from "@/components/control-panel/dashboard/DashboardAppointmentStatusBadge";
import { DashboardDoctorIdentityInline } from "@/components/control-panel/dashboard/DashboardDoctorIdentityInline";
import { DashboardMetaIconRow } from "@/components/control-panel/dashboard/DashboardMetaIconRow";
import { DashboardPatientIdentityInline } from "@/components/control-panel/dashboard/DashboardPatientIdentityInline";
import {
  dashboardAppointmentRelativeIconClass,
  dashboardAppointmentRelativeTimeClass,
  resolveDashboardAppointmentRelativeTone,
} from "@/lib/dashboard-appointment-relative-time";
import { appointmentDetailHref } from "@/lib/entity-routes";
import {
  controlPanelDashboardListRowClass,
  controlPanelDashboardQueueItemStackClass,
} from "@/lib/control-panel-glass-card";
import type { DashboardOverviewQueueAppointment } from "@/lib/dashboard-overview-queue";

type Props = {
  appointment: DashboardOverviewQueueAppointment;
  dateVariant?: "full" | "short";
  showRelativeTime?: boolean;
  /** When true, parent supplies list row chrome (recent-activity card). */
  embedded?: boolean;
};

/** Single upcoming/recent queue row — shared layout for overview panels. */
export function DashboardQueueAppointmentRow({
  appointment,
  dateVariant = "full",
  showRelativeTime = true,
  embedded = false,
}: Props) {
  const href = appointmentDetailHref("admin", appointment.id);
  const relativeTone = resolveDashboardAppointmentRelativeTone(appointment.start);

  return (
    <div className={embedded ? controlPanelDashboardQueueItemStackClass : controlPanelDashboardListRowClass}>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <EntityTitleLink
          href={href}
          label={appointment.title}
          className="min-w-0 flex-1 text-sm font-semibold"
          wrapLabel={false}
        />
        <DashboardAppointmentStatusBadge status={appointment.status} />
      </div>
      <DashboardAppointmentScheduleMetaRow
        start={appointment.start}
        end={appointment.end}
        location={appointment.location}
        isTelehealth={appointment.is_telehealth}
        dateVariant={dateVariant}
        relativeTone={relativeTone}
      />
      {appointment.patient ? (
        <DashboardPatientIdentityInline patient={appointment.patient} />
      ) : null}
      {appointment.treatingDoctor ? (
        <DashboardDoctorIdentityInline doctor={appointment.treatingDoctor} />
      ) : null}
      {showRelativeTime ? (
        <DashboardMetaIconRow
          icon={Clock}
          iconClassName={dashboardAppointmentRelativeIconClass[relativeTone]}
          labelClassName={dashboardAppointmentRelativeTimeClass[relativeTone]}
        >
          {formatDistanceToNow(new Date(appointment.start), { addSuffix: true })}
        </DashboardMetaIconRow>
      ) : null}
    </div>
  );
}
