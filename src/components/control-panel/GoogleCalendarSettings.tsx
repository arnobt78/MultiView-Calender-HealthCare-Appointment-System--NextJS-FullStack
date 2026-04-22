"use client";

import { useRef } from "react";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CalendarCheck2,
  CalendarX2,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  Calendar,
} from "lucide-react";

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) importICS(file);
    if (e.target) e.target.value = "";
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Google Calendar Integration
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connect, sync, import and export appointments with Google Calendar.
        </p>
      </div>

      {/* Status card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Connection Status
            <Badge className={isConnected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
              {isConnected ? "Connected" : "Not connected"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {isConnected
              ? "Your Google Calendar is linked. Appointments can be synced bi-directionally."
              : "Connect Google Calendar to sync appointments and receive reminders in Google Calendar."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {!isConnected ? (
            <Button asChild className="gap-2">
              <a href="/api/calendar/connect">
                <CalendarCheck2 className="h-4 w-4" />
                Connect Google Calendar
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2" disabled={isDisconnecting}>
                  <CalendarX2 className="h-4 w-4" />
                  {isDisconnecting ? "Disconnecting…" : "Disconnect"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect Google Calendar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the OAuth token. Your existing appointments will not be deleted,
                    but future syncs will stop working until you reconnect.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => disconnect()}
                  >
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* ICS Import / Export */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
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
            <Button
              variant="outline"
              className="gap-2"
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {isImporting ? "Importing…" : "Choose .ics file"}
            </Button>
          </CardContent>
        </Card>

        <Card>
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
              <a href={exportUrl} download="vocare-appointments.ics">
                <Download className="h-4 w-4" />
                Download .ics
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sync info */}
      {isConnected && (
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="pt-4 flex items-start gap-3">
            <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-blue-800 text-sm">Auto-sync enabled</p>
              <p className="text-xs text-blue-700 mt-0.5">
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
