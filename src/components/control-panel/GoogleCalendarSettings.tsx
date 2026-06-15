"use client";

/**
 * GoogleCalendarSettings — C36 CP glass parity (REQ-0084):
 * SSR status seed + useCpListBodyLoading; static card chrome; dynamic values pulse.
 * OAuth return handled via ?gcal=connected → invalidate + toast + clean URL.
 */

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Download, RefreshCw } from "lucide-react";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { ControlPanelHeaderSubtitle } from "@/components/control-panel/ControlPanelHeaderSubtitle";
import { ControlPanelHeaderGlassButton } from "@/components/control-panel/ControlPanelHeaderGlassButton";
import { GoogleCalendarConnectionCard } from "@/components/control-panel/google-calendar/GoogleCalendarConnectionCard";
import { GoogleCalendarStatsRow } from "@/components/control-panel/google-calendar/GoogleCalendarStatsRow";
import { GoogleCalendarEventsPanel } from "@/components/control-panel/google-calendar/GoogleCalendarEventsPanel";
import { GoogleCalendarIcsPanel } from "@/components/control-panel/google-calendar/GoogleCalendarIcsPanel";
import { GoogleCalendarSyncInfoCard } from "@/components/control-panel/google-calendar/GoogleCalendarSyncInfoCard";
import { GoogleCalendarEventsFetchWarningBanner } from "@/components/control-panel/google-calendar/GoogleCalendarEventsFetchWarningBanner";
import { GoogleCalendarAdvancedImportCard } from "@/components/control-panel/google-calendar/GoogleCalendarAdvancedImportCard";
import { useCpListBodyLoading } from "@/lib/cp-list-body-loading";
import { queryKeys } from "@/lib/query-keys";
import { invalidateGoogleCalendarAndCrossTab } from "@/lib/query-client";
import { notify } from "@/lib/notify";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import {
  skyGlassBackButtonClass,
  violetGlassImportButtonClass,
} from "@/lib/calendar-header-action-styles";
import { googleCalendarIcsCopy } from "@/lib/google-calendar-ui-classes";
import { cn } from "@/lib/utils";
import { isGoogleCalendarOAuthConnectedParam } from "@/lib/google-calendar-routes";

export default function GoogleCalendarSettings() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    isConnected,
    events,
    eventCount,
    upcomingCount,
    eventsFetchWarning,
    isLoading,
    isFetching,
    refreshStatus,
    backfillToGoogleAsync,
    isBackfilling,
    disconnectAsync,
    isDisconnecting,
    importICS,
    importICSWithDoctorAsync,
    isImporting,
    exportUrl,
  } = useGoogleCalendar();

  const statusKey = [...queryKeys.googleCalendar.root, "status"] as const;
  const listBodyLoading = useCpListBodyLoading(statusKey, isLoading);

  /** OAuth success — backfill unsynced visits, bust cache, toast, strip query param. */
  useEffect(() => {
    if (isGoogleCalendarOAuthConnectedParam(searchParams)) {
      void (async () => {
        await invalidateGoogleCalendarAndCrossTab(queryClient);
        try {
          await backfillToGoogleAsync();
        } catch {
          // Toast handled in hook; stay on page.
        }
        await refreshStatus();
      })();
      notify.crud({
        action: "created",
        entity: "Google Calendar",
        detail: "Your Google Calendar is now connected.",
      });
      router.replace(pathname, { scroll: false });
      return;
    }
    const error = searchParams.get("error");
    if (error === "gcal_failed") {
      notify.error({
        title: "Google Calendar connection failed",
        subtitle: "Please try connecting again.",
      });
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, queryClient, router, pathname, refreshStatus, backfillToGoogleAsync]);

  const handleRefresh = () => {
    void refreshStatus();
  };

  const headerActions = (
    <div className="flex w-full flex-wrap items-center justify-end gap-2 self-center">
      <ControlPanelHeaderGlassButton
        glassClassName={cn(skyGlassBackButtonClass, "disabled:opacity-50")}
        icon={isFetching ? undefined : RefreshCw}
        disabled={isFetching}
        aria-busy={isFetching}
        onClick={handleRefresh}
      >
        {isFetching ? (
          <>
            <RefreshCw className="shrink-0 animate-spin" aria-hidden />
            Refreshing…
          </>
        ) : (
          "Refresh"
        )}
      </ControlPanelHeaderGlassButton>
      <Link
        href={exportUrl}
        download="healthcalpro-appointments.ics"
        className={cn(violetGlassImportButtonClass, "inline-flex h-10 items-center gap-2 px-4 no-underline")}
      >
        <Download className="h-4 w-4 shrink-0" aria-hidden />
        {googleCalendarIcsCopy.exportHeaderButton}
      </Link>
    </div>
  );

  const subtitleNode = (
    <ControlPanelHeaderSubtitle lead="Connect Google Calendar for two-way sync with HealthCal Pro." />
  );

  return (
    <>
      <ControlPanelPageChrome
        tab="google-calendar"
        actions={headerActions}
        description={subtitleNode}
      />
      <div className={controlPanelSectionRootClass}>
        <GoogleCalendarStatsRow
          isConnected={isConnected}
          eventCount={eventCount}
          upcomingCount={upcomingCount}
          listBodyLoading={listBodyLoading}
          isFetching={isFetching || isBackfilling}
        />

        {isConnected && eventsFetchWarning ? (
          <GoogleCalendarEventsFetchWarningBanner
            warning={eventsFetchWarning}
            isRefreshing={isFetching}
            onRefresh={handleRefresh}
          />
        ) : null}

        <GoogleCalendarConnectionCard
          isConnected={isConnected}
          listBodyLoading={listBodyLoading}
          isDisconnecting={isDisconnecting}
          onDisconnect={async () => {
            await disconnectAsync();
          }}
        />

        <GoogleCalendarSyncInfoCard
          isConnected={isConnected}
          isFetching={isFetching}
          onRefresh={handleRefresh}
        />

        <GoogleCalendarEventsPanel
          events={events}
          isConnected={isConnected}
          listBodyLoading={listBodyLoading}
        />

        <GoogleCalendarIcsPanel
          exportUrl={exportUrl}
          isImporting={isImporting}
          onImportFile={importICS}
        />

        <GoogleCalendarAdvancedImportCard
          isImporting={isImporting}
          onImport={async (file, doctorId) => {
            await importICSWithDoctorAsync(file, doctorId);
          }}
        />
      </div>
    </>
  );
}
