"use client";

/**
 * GoogleCalendarSettings — C36 CP glass parity (REQ-0084):
 * SSR status seed + useCpListBodyLoading; static card chrome; dynamic values pulse.
 * OAuth return handled via ?gcal=connected → invalidate + toast + clean URL.
 */

import { useEffect, useRef } from "react";
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
import { invalidateGoogleCalendarAndCrossTab, invalidateAfterAppointmentMutation } from "@/lib/query-client";
import { notify } from "@/lib/notify";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import {
  skyGlassBackButtonClass,
  violetGlassImportButtonClass,
} from "@/lib/calendar-header-action-styles";
import { googleCalendarIcsCopy } from "@/lib/google-calendar-ui-classes";
import { cn } from "@/lib/utils";
import {
  isGoogleCalendarOAuthConnectedParam,
  GOOGLE_CALENDAR_CONNECTED_QUERY_KEY,
  GOOGLE_CALENDAR_CONNECTED_QUERY_VALUE,
} from "@/lib/google-calendar-routes";
import { shouldRunGoogleCalendarOAuthBackfill } from "@/lib/google-calendar-oauth-connect";
import { apiClient } from "@/lib/api-client";
import type { GoogleCalendarBackfillSummary } from "@/types/google-calendar";

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
    disconnectAsync,
    isDisconnecting,
    importICS,
    importICSWithDoctorAsync,
    isImporting,
    exportUrl,
  } = useGoogleCalendar();

  const statusKey = [...queryKeys.googleCalendar.root, "status"] as const;
  const listBodyLoading = useCpListBodyLoading(statusKey, isLoading);
  const gcalParam = searchParams.get(GOOGLE_CALENDAR_CONNECTED_QUERY_KEY);
  /** In-flight guard — pairs with sessionStorage in shouldRunGoogleCalendarOAuthBackfill. */
  const oauthConnectHandlingRef = useRef(false);

  /** OAuth success — once: strip param, backfill, invalidate, toast. */
  useEffect(() => {
    if (gcalParam !== GOOGLE_CALENDAR_CONNECTED_QUERY_VALUE) return;
    if (oauthConnectHandlingRef.current) return;
    if (!shouldRunGoogleCalendarOAuthBackfill(gcalParam)) {
      router.replace(pathname, { scroll: false });
      return;
    }

    oauthConnectHandlingRef.current = true;
    router.replace(pathname, { scroll: false });

    notify.crud({
      action: "created",
      entity: "Google Calendar",
      detail: "Your Google Calendar is now connected.",
    });

    void (async () => {
      try {
        await invalidateGoogleCalendarAndCrossTab(queryClient);
        const result = await apiClient<{ backfill: GoogleCalendarBackfillSummary }>(
          "/api/calendar/backfill",
          { method: "POST" }
        );
        const { synced, attempted } = result.backfill;
        if (synced > 0) {
          notify.crud({
            action: "created",
            entity: "Google Calendar sync",
            detail: `${synced} existing appointment(s) were pushed to Google Calendar.`,
          });
          await invalidateAfterAppointmentMutation(queryClient, {
            bustAllCategorySnapshots: false,
          });
        } else if (attempted > 0) {
          notify.error({
            title: "Google Calendar backfill incomplete",
            subtitle:
              "Some appointments could not be synced. Try Sync to Google Calendar per visit.",
          });
        }
        await invalidateGoogleCalendarAndCrossTab(queryClient);
      } catch {
        // Non-blocking — user can refresh manually.
      } finally {
        oauthConnectHandlingRef.current = false;
      }
    })();

    return;
  }, [gcalParam, queryClient, router, pathname]);

  useEffect(() => {
    if (isGoogleCalendarOAuthConnectedParam(searchParams)) return;
    const error = searchParams.get("error");
    if (error === "gcal_failed") {
      notify.error({
        title: "Google Calendar connection failed",
        subtitle: "Please try connecting again.",
      });
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, router, pathname]);

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
          isFetching={isFetching}
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
