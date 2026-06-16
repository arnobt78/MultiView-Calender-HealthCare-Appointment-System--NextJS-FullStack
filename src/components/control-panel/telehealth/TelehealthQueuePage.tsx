"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, Video } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useAppointments } from "@/hooks/useAppointments";
import { useDoctorsDirectory } from "@/hooks/useDoctorsDirectory";
import { usePayments } from "@/hooks/usePayments";
import { useAppStore } from "@/store/useAppStore";
import { useAuth } from "@/hooks/useAuth";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { PortalPageChrome } from "@/components/shared/PortalPageChrome";
import { AppSectionErrorBanner } from "@/components/shared/AppSectionErrorBanner";
import { DashboardQueuePanelCard } from "@/components/control-panel/dashboard/DashboardQueuePanelCard";
import { TelehealthQueueFilterPills } from "@/components/control-panel/telehealth/TelehealthQueueFilterPills";
import { TelehealthQueueStatsRow } from "@/components/control-panel/telehealth/TelehealthQueueStatsRow";
import { TelehealthUpNextCard } from "@/components/control-panel/telehealth/TelehealthUpNextCard";
import { TelehealthQueueList } from "@/components/control-panel/telehealth/TelehealthQueueList";
import { TelehealthQueueChromeActions } from "@/components/control-panel/telehealth/TelehealthQueueChromeActions";
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
import {
  buildTelehealthQueueFilterSearchParams,
  parseTelehealthQueueDateFilter,
  TELEHEALTH_QUEUE_FILTER_PARAM,
} from "@/lib/telehealth-queue-ui-state";
import type { EntityRole } from "@/lib/entity-routes";
import {
  resolveAppSectionRootClass,
  type AppSectionScrollShell,
} from "@/lib/section-page-layout";
import {
  seedTelehealthQueuePortalCacheFromSsr,
  type TelehealthQueuePortalPrefetch,
} from "@/lib/telehealth-queue-portal-prefetch";
import { getInvoiceForAppointment } from "@/lib/appointment-invoice-lookup";
import {
  resolveAppointmentVisitMetaBilling,
  type AppointmentVisitMetaBilling,
} from "@/lib/appointment-visit-meta-resolve";

type TelehealthQueuePageProps = {
  /** SSR role — portal route passes explicitly; CP falls back to `useAuth`. */
  viewerRole?: EntityRole;
  shell?: AppSectionScrollShell;
  /** Portal SSR prefetch — seeds appointments bundle + doctors directory before paint. */
  initialPrefetch?: TelehealthQueuePortalPrefetch | null;
};

/**
 * Telehealth queue — shared by CP and portal.
 *
 * Loading (parity with AppointmentsManagement / PatientManagement):
 * - `useCpListBodyLoading(appointments.all)` only — skeleton when appointments cache cold.
 * - Doctors directory + invoices.all SSR-seeded on telehealth routes so identity rows
 *   and billing badges render on first paint without a second fetch pass.
 *
 * Tab persistence: `?filter=today|upcoming|all` — URL is SSR-safe (no sessionStorage hydrate mismatch).
 */
export function TelehealthQueuePage({
  viewerRole: viewerRoleProp,
  shell = "control-panel",
  initialPrefetch,
}: TelehealthQueuePageProps = {}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const resolvedViewerRole: EntityRole = viewerRoleProp ?? user?.role ?? "admin";
  const isPortalShell = shell === "portal";

  /** Portal path — sync seed before hooks subscribe (seedIfAbsent). */
  useMemo(() => {
    if (initialPrefetch != null) {
      seedTelehealthQueuePortalCacheFromSsr(queryClient, initialPrefetch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  const { appointments, isLoading, isError: appointmentsError } = useAppointments();

  /** Doctors directory — warm from SSR seed in parent `seedControlPanelSectionCacheFromSsr` or portal prefetch. */
  const { data: doctorsDirectory } = useDoctorsDirectory();
  const doctors = doctorsDirectory?.doctors ?? null;
  const startVideoCall = useAppStore((state) => state.startVideoCall);

  /** Date tab from URL — server + client read the same `?filter=` (no hydration mismatch). */
  const dateFilter = parseTelehealthQueueDateFilter(
    searchParams.get(TELEHEALTH_QUEUE_FILTER_PARAM)
  );

  /** Appointments-only warm-cache gate — same pattern as AppointmentsManagement. */
  const listBodyLoading = useCpListBodyLoading(queryKeys.appointments.all, isLoading);

  const filteredAppointments = useMemo(
    () => filterTelehealthQueueAppointments(appointments, dateFilter),
    [appointments, dateFilter]
  );

  const upNext = useMemo(() => resolveTelehealthUpNext(appointments), [appointments]);

  const telehealthIds = useMemo(
    () => appointments.filter((a) => a.is_telehealth).map((a) => a.id),
    [appointments]
  );

  /** Billing badges — warm from SSR-seeded `queryKeys.invoices.all` (CP + portal prefetch). */
  const { invoices, isLoading: invoicesLoading } = usePayments();
  const billingBadgesLoading = useCpListBodyLoading(
    queryKeys.invoices.all,
    invoicesLoading
  );

  const billingByAppointmentId = useMemo(() => {
    const map = new Map<string, AppointmentVisitMetaBilling>();
    const list = invoices ?? [];
    for (const id of telehealthIds) {
      const invoice = getInvoiceForAppointment(list, id);
      map.set(id, resolveAppointmentVisitMetaBilling(invoice ?? null));
    }
    return map;
  }, [telehealthIds, invoices]);

  const handleDateFilterChange = (next: TelehealthQueueDateFilter) => {
    const qs = buildTelehealthQueueFilterSearchParams(searchParams, next);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleJoin = (appointmentId: string) => {
    startVideoCall(appointmentId);
  };

  const filterPills = (
    <TelehealthQueueFilterPills value={dateFilter} onChange={handleDateFilterChange} />
  );

  const chromeActions = (
    <div className="flex flex-wrap items-center gap-2">
      <TelehealthQueueChromeActions viewerRole={resolvedViewerRole} />
      {filterPills}
    </div>
  );

  const rootClass = isPortalShell
    ? resolveAppSectionRootClass("portal")
    : controlPanelSectionRootClass;

  return (
    <div className={rootClass}>
      {appointmentsError ? (
        <AppSectionErrorBanner>
          Failed to load appointments. Please refresh.
        </AppSectionErrorBanner>
      ) : null}

      {isPortalShell ? (
        <PortalPageChrome route="telehealth_queue" actions={chromeActions} />
      ) : (
        <ControlPanelPageChrome tab="telehealth" actions={chromeActions} />
      )}

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
              billing={billingByAppointmentId.get(upNext.id)}
              billingBadgesLoading={billingBadgesLoading}
              onJoin={() => handleJoin(upNext.id)}
              viewerRole={resolvedViewerRole}
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
            billingByAppointmentId={billingByAppointmentId}
            billingBadgesLoading={billingBadgesLoading}
            listBodyLoading={listBodyLoading}
            onJoin={handleJoin}
            viewerRole={resolvedViewerRole}
          />
        </div>
      </div>
    </div>
  );
}

export default TelehealthQueuePage;
