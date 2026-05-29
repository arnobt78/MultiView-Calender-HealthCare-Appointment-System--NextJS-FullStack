"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { DashboardQueueActivityMetaRow } from "@/components/control-panel/dashboard/DashboardQueueActivityMetaRow";
import { DashboardQueueAppointmentRow } from "@/components/control-panel/dashboard/DashboardQueueAppointmentRow";
import { controlPanelDashboardListRowClass } from "@/lib/control-panel-glass-card";
import type { DashboardOverviewRecentQueueAppointment } from "@/lib/dashboard-overview-queue";

type Props = {
  appointments: DashboardOverviewRecentQueueAppointment[];
  loading?: boolean;
};

/** Last 5 create/update activities — schedule + identities + activity actor row. */
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
        No recent appointment activity.
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-100/90">
      {appointments.map((appt) => (
        <div key={appt.id} className={controlPanelDashboardListRowClass}>
          <DashboardQueueAppointmentRow
            appointment={appt}
            dateVariant="short"
            showRelativeTime={false}
            embedded
          />
          <DashboardQueueActivityMetaRow
            kind={appt.activityKind}
            activityAt={appt.activityAt}
            actor={appt.actor}
          />
        </div>
      ))}
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
      <Skeleton className="h-3 w-4/5 max-w-[16rem] rounded" />
    </div>
  );
}
