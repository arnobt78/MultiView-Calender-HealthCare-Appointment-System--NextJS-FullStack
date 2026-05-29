"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { DashboardQueueAppointmentRow } from "@/components/control-panel/dashboard/DashboardQueueAppointmentRow";
import { controlPanelDashboardListRowClass } from "@/lib/control-panel-glass-card";
import type { DashboardOverviewQueueAppointment } from "@/lib/dashboard-overview-queue";

type Props = {
  upcomingAppointments: DashboardOverviewQueueAppointment[];
  loading?: boolean;
};

/** Up to five closest future queue appointments (today + later), tone on relative time. */
export function DashboardNextAppointmentBody({
  upcomingAppointments,
  loading = false,
}: Props) {
  if (loading) {
    return <DashboardUpcomingAppointmentsSkeleton />;
  }

  if (upcomingAppointments.length === 0) {
    return (
      <p className="py-2 text-center text-sm text-muted-foreground" role="status">
        No upcoming appointments.
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-100/90">
      {upcomingAppointments.map((appt) => (
        <DashboardQueueAppointmentRow key={appt.id} appointment={appt} dateVariant="full" />
      ))}
    </div>
  );
}

function DashboardUpcomingAppointmentsSkeleton() {
  return (
    <div className="divide-y divide-slate-100/90">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={controlPanelDashboardListRowClass}>
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-3/4 max-w-[14rem] rounded" />
            <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full max-w-[18rem] rounded" />
          <Skeleton className="h-6 w-full max-w-[14rem] rounded" />
          <Skeleton className="h-6 w-3/4 max-w-[12rem] rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
      ))}
    </div>
  );
}
