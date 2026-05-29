"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { EntityTitleLink } from "@/components/shared/EntityTitleLink";
import { DashboardAppointmentStatusBadge } from "@/components/control-panel/dashboard/DashboardAppointmentStatusBadge";
import { DashboardAppointmentScheduleMetaRow } from "@/components/control-panel/dashboard/DashboardAppointmentScheduleMetaRow";
import { DashboardDoctorIdentityInline } from "@/components/control-panel/dashboard/DashboardDoctorIdentityInline";
import { DashboardPatientIdentityInline } from "@/components/control-panel/dashboard/DashboardPatientIdentityInline";
import { appointmentDetailHref } from "@/lib/entity-routes";
import { controlPanelDashboardListRowClass } from "@/lib/control-panel-glass-card";
import type { DashboardOverviewQueueAppointment } from "@/lib/dashboard-overview-queue";

type Props = {
  appointments: DashboardOverviewQueueAppointment[];
  loading?: boolean;
};

/** Recently created list — sky title link, datetime + location row, patient + doctor identity rows. */
export function DashboardRecentAppointmentsBody({ appointments, loading = false }: Props) {
  if (loading) {
    return (
      <div className="divide-y divide-slate-100/90">
        {Array.from({ length: 3 }).map((_, i) => (
          <RecentAppointmentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <p className="py-2 text-center text-sm text-muted-foreground" role="status">
        No appointments yet.
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-100/90">
      {appointments.map((appt) => (
        <RecentAppointmentRow key={appt.id} appt={appt} />
      ))}
    </div>
  );
}

function RecentAppointmentRow({ appt }: { appt: DashboardOverviewQueueAppointment }) {
  return (
    <div className={controlPanelDashboardListRowClass}>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <EntityTitleLink
          href={appointmentDetailHref("admin", appt.id)}
          label={appt.title}
          className="min-w-0 flex-1 text-sm font-medium"
          wrapLabel={false}
        />
        <DashboardAppointmentStatusBadge status={appt.status} />
      </div>
      <DashboardAppointmentScheduleMetaRow
        start={appt.start}
        end={appt.end}
        location={appt.location}
        isTelehealth={appt.is_telehealth}
        dateVariant="short"
      />
      {appt.patient ? <DashboardPatientIdentityInline patient={appt.patient} /> : null}
      {appt.treatingDoctor ? <DashboardDoctorIdentityInline doctor={appt.treatingDoctor} /> : null}
    </div>
  );
}

function RecentAppointmentSkeleton() {
  return (
    <div className={controlPanelDashboardListRowClass}>
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-3/4 max-w-[14rem] rounded" />
        <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full max-w-[14rem] rounded" />
      <Skeleton className="h-3 w-2/3 max-w-[12rem] rounded" />
      <Skeleton className="h-3 w-1/2 max-w-[10rem] rounded" />
    </div>
  );
}
