"use client";

/**
 * GoogleCalendarSettings — inline skeleton pattern:
 *   - Card frames, card titles, card descriptions, and import/export buttons stay mounted.
 *   - Only the connection status badge and sync-info area pulse as skeletons while loading.
 *   - `isMounted` + `requestAnimationFrame` guard prevents hydration flicker.
 */

import { useRef, useEffect, useState } from "react";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ControlPanelPageChrome } from "@/components/control-panel/ControlPanelPageChrome";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
  buildGoogleCalendarDisconnectConfirmSubtitle,
  DISCONNECT_GOOGLE_CALENDAR_CONFIRM_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
import {
  CalendarCheck2,
  CalendarX2,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";

export default function GoogleCalendarSettings() {
  const {
    isConnected,
    isLoading,
    disconnect,
    isDisconnecting,
    importICS,
    isImporting,
    exportUrl,
  } = useGoogleCalendar();

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Mount guard: hydrate with skeleton state on first paint, then swap to real connection data
   * after the next animation frame — prevents hydration flicker.
   */
  const [isMounted, setIsMounted] = useState(false);
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  const loading = !isMounted || isLoading;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) importICS(file);
    if (e.target) e.target.value = "";
  }

  return (
    <div className={controlPanelSectionRootClass}>
      <ControlPanelPageChrome tab="google-calendar" />

      {/* Status card — card frame + title stay static; badge + description pulse while loading */}
      <Card className="rounded-[28px] border bg-gradient-to-br from-sky-500/10 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(2,132,199,0.1)]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Connection Status
            {/* Status badge: pulse while loading */}
            {loading ? (
              <Skeleton className="h-5 w-24 rounded-full" />
            ) : (
              <Badge className={isConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                {isConnected ? "Connected" : "Not connected"}
              </Badge>
            )}
          </CardTitle>
          {/* Description: pulse while loading */}
          {loading ? (
            <Skeleton className="h-4 w-4/5 rounded mt-1" />
          ) : (
            <CardDescription>
              {isConnected
                ? "Your Google Calendar is linked. Appointments can be synced bi-directionally."
                : "Connect Google Calendar to sync appointments and receive reminders in Google Calendar."}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {loading ? (
            /* Action button: pulse while loading */
            <Skeleton className="h-9 w-48 rounded-lg" />
          ) : !isConnected ? (
            <Button asChild className="gap-2">
              <a href="/api/calendar/connect">
                <CalendarCheck2 className="h-4 w-4" />
                Connect Google Calendar
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          ) : (
            <>
              <Button
                variant="destructive"
                className="gap-2"
                disabled={isDisconnecting}
                onClick={() => setDisconnectConfirmOpen(true)}
              >
                <CalendarX2 className="h-4 w-4" />
                {isDisconnecting ? "Disconnecting…" : "Disconnect"}
              </Button>
              <ConfirmActionDialog
                open={disconnectConfirmOpen}
                onOpenChange={setDisconnectConfirmOpen}
                variant="warning"
                title={DISCONNECT_GOOGLE_CALENDAR_CONFIRM_TITLE}
                subtitle={buildGoogleCalendarDisconnectConfirmSubtitle()}
                confirmLabel="Disconnect"
                cancelLabel="Cancel"
                confirmDisabled={isDisconnecting}
                onConfirm={() => {
                  disconnect();
                  setDisconnectConfirmOpen(false);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* ICS Import / Export — always fully static (no API data involved) */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="rounded-[28px] border bg-gradient-to-br from-emerald-500/8 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(16,185,129,0.08)]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import ICS
            </CardTitle>
            <CardDescription>
              Import appointments from a .ics calendar file (Google Calendar, Outlook, Apple Calendar).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              id="ics-import-file"
              type="file"
              accept=".ics"
              aria-label="Select .ics calendar file to import"
              title="Select .ics calendar file to import"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button variant="outline" className="gap-2" disabled={isImporting} onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              {isImporting ? "Importing…" : "Choose .ics file"}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border bg-gradient-to-br from-indigo-500/8 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(99,102,241,0.08)]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export ICS
            </CardTitle>
            <CardDescription>
              Export all your appointments as a .ics file for use in any calendar application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="gap-2" asChild>
              <a href={exportUrl} download="healthcalpro-appointments.ics">
                <Download className="h-4 w-4" />
                Download .ics
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sync info — only visible when connected (data-driven, no skeleton needed — it appears after loading) */}
      {!loading && isConnected && (
        <Card className="border-blue-200 bg-blue-50/40 rounded-[28px]">
          <CardContent className="pt-4 flex items-start gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600  shrink-0" />
            <div>
              <p className="font-medium text-blue-800 text-sm">Auto-sync enabled</p>
              <p className="text-xs text-blue-700 ">
                New appointments are automatically synced to your Google Calendar when created.
                Use the sync button on individual appointments for manual sync.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
