"use client";

import { useMemo, useState } from "react";
import { Calendar, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useAppointments } from "@/hooks/useAppointments";
import { useDoctorsDirectory } from "@/hooks/useDoctorsDirectory";
import { useAppStore } from "@/store/useAppStore";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { DashboardQueuePanelCard } from "@/components/control-panel/dashboard/DashboardQueuePanelCard";
import { TelehealthQueueFilterPills } from "@/components/control-panel/telehealth/TelehealthQueueFilterPills";
import { TelehealthQueueStatsRow } from "@/components/control-panel/telehealth/TelehealthQueueStatsRow";
import { TelehealthUpNextCard } from "@/components/control-panel/telehealth/TelehealthUpNextCard";
import { TelehealthQueueList } from "@/components/control-panel/telehealth/TelehealthQueueList";
import { useCpListBodyLoading } from "@/lib/cp-list-body-loading";
import { queryKeys } from "@/lib/query-keys";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import {
  filterTelehealthQueueAppointments,
  resolveTelehealthUpNext,
  type TelehealthQueueDateFilter,
} from "@/lib/telehealth-queue-filter";
import {
  telehealthQueueGridClass,
  telehealthQueueLivePulseDotClass,
  telehealthQueueScheduleColumnClass,
  telehealthQueueSectionTitleClass,
  telehealthQueueUpNextColumnClass,
} from "@/lib/telehealth-queue-ui-classes";

/**
 * Telehealth queue — SSR appointments seed + client `is_telehealth` filter.
 * Chrome and panel shells stay mounted; only value slots pulse while loading.
 */
export function TelehealthQueuePage() {
  const { appointments, isLoading, isError: appointmentsError } = useAppointments();
  const { data: doctorsDirectory } = useDoctorsDirectory();
  const doctors = doctorsDirectory?.doctors ?? null;
  const startVideoCall = useAppStore((state) => state.startVideoCall);
  const [dateFilter, setDateFilter] = useState<TelehealthQueueDateFilter>("today");
  const listBodyLoading = useCpListBodyLoading(queryKeys.appointments.all, isLoading);

  const filteredAppointments = useMemo(
    () => filterTelehealthQueueAppointments(appointments, dateFilter),
    [appointments, dateFilter]
  );

  const upNext = useMemo(() => resolveTelehealthUpNext(appointments), [appointments]);

  const handleJoin = (appointmentId: string) => {
    startVideoCall(appointmentId);
  };

  return (
    <div className={controlPanelSectionRootClass}>
      {appointmentsError ? (
        <AppSectionErrorBanner>
          Failed to load appointments. Please refresh.
        </AppSectionErrorBanner>
      ) : null}

      <ControlPanelPageChrome
        tab="telehealth"
        actions={<TelehealthQueueFilterPills value={dateFilter} onChange={setDateFilter} />}
      />

      <TelehealthQueueStatsRow appointments={appointments} listBodyLoading={listBodyLoading} />

      <div className={telehealthQueueGridClass}>
        <div className={telehealthQueueUpNextColumnClass}>
          <h3 className={telehealthQueueSectionTitleClass}>
            <span className={telehealthQueueLivePulseDotClass}>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-500 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-violet-600" />
            </span>
            Up Next
          </h3>
          {listBodyLoading ? (
            <DashboardQueuePanelCard
              title="Up Next"
              subtitle="Loading next telehealth session…"
              icon={Video}
              iconClassName="border-violet-100 bg-violet-50 [&_svg]:text-violet-600"
              className="border-violet-400/25"
            >
              <Card className="border-0 shadow-none">
                <CardContent className="space-y-4 p-0 pt-2">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-8 w-full rounded" />
                  <Skeleton className="h-6 w-40 rounded" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </CardContent>
              </Card>
            </DashboardQueuePanelCard>
          ) : upNext ? (
            <TelehealthUpNextCard
              appointment={upNext}
              doctors={doctors}
              onJoin={() => handleJoin(upNext.id)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-violet-200/80 bg-violet-50/30 p-4 text-center">
              <Calendar className="size-10 text-violet-300" aria-hidden />
              <p className="text-base font-medium text-muted-foreground">No upcoming telehealth sessions</p>
              <p className="text-xs text-muted-foreground">
                Schedule a video visit type to see it here.
              </p>
            </div>
          )}
        </div>

        <div className={telehealthQueueScheduleColumnClass}>
          <TelehealthQueueList
            appointments={filteredAppointments}
            dateFilter={dateFilter}
            doctors={doctors}
            listBodyLoading={listBodyLoading}
            onJoin={handleJoin}
          />
        </div>
      </div>
    </div>
  );
}

export default TelehealthQueuePage;
