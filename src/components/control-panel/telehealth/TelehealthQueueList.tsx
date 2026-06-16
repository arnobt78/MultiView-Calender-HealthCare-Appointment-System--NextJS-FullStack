"use client";

import { Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardQueuePanelCard } from "@/components/control-panel/dashboard/DashboardQueuePanelCard";
import { TelehealthQueueRow } from "@/components/control-panel/telehealth/TelehealthQueueRow";
import { TelehealthQueueScheduleEmptyState } from "@/components/control-panel/telehealth/TelehealthQueueScheduleEmptyState";
import { buildTelehealthQueueEmptyCopy } from "@/lib/telehealth-queue-empty-copy";
import {
  telehealthQueueSchedulePanelClass,
  telehealthQueueSchedulePanelIconClass,
} from "@/lib/telehealth-queue-ui-classes";
import type { TelehealthQueueDateFilter } from "@/lib/telehealth-queue-filter";
import type { EntityRole } from "@/lib/entity-routes";
import type { AppointmentVisitMetaBilling } from "@/lib/appointment-visit-meta-resolve";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import type { FullAppointment } from "@/hooks/useAppointments";

type Props = {
  appointments: FullAppointment[];
  dateFilter: TelehealthQueueDateFilter;
  doctors?: DoctorDirectoryRow[] | null;
  billingByAppointmentId?: Map<string, AppointmentVisitMetaBilling>;
  billingBadgesLoading?: boolean;
  listBodyLoading: boolean;
  onJoin: (appointmentId: string) => void;
  viewerRole?: EntityRole;
};

function scheduleTitle(filter: TelehealthQueueDateFilter): string {
  if (filter === "today") return "Today's Schedule";
  if (filter === "upcoming") return "Upcoming Queue";
  return "All Telehealth Visits";
}

/** Schedule list inside sky glass panel — filter-aware centered empty state. */
export function TelehealthQueueList({
  appointments,
  dateFilter,
  doctors,
  billingByAppointmentId,
  billingBadgesLoading = false,
  listBodyLoading,
  onJoin,
  viewerRole = "admin",
}: Props) {
  const emptyCopy = buildTelehealthQueueEmptyCopy(dateFilter);

  return (
    <DashboardQueuePanelCard
      title={scheduleTitle(dateFilter)}
      subtitle="Video visits only — join or open detail"
      icon={Calendar}
      iconClassName={telehealthQueueSchedulePanelIconClass}
      count={listBodyLoading ? undefined : appointments.length}
      className={telehealthQueueSchedulePanelClass}
    >
      {listBodyLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="space-y-2 rounded-2xl border border-violet-200/40 bg-gradient-to-br from-violet-500/[0.06] via-white/90 to-white/95 p-4 shadow-[0_6px_22px_rgba(139,92,246,0.12)]"
            >
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
              <Skeleton className="h-6 w-full max-w-[14rem] rounded" />
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <TelehealthQueueScheduleEmptyState icon={Calendar} copy={emptyCopy} />
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <TelehealthQueueRow
              key={appt.id}
              appointment={appt}
              doctors={doctors}
              billing={billingByAppointmentId?.get(appt.id)}
              billingBadgesLoading={billingBadgesLoading}
              onJoin={() => onJoin(appt.id)}
              viewerRole={viewerRole}
            />
          ))}
        </div>
      )}
    </DashboardQueuePanelCard>
  );
}
