"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck2, CalendarX2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PortalPanelSubsectionHeader } from "@/components/shared/PortalPanelSubsectionHeader";
import { GoogleCalendarConnectionGlassBadge } from "@/components/control-panel/google-calendar/GoogleCalendarConnectionGlassBadge";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import { skyGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { ConfirmActionDialog } from "@/components/shared/ConfirmActionDialog";
import {
  buildGoogleCalendarDisconnectConfirmSubtitle,
  DISCONNECT_GOOGLE_CALENDAR_CONFIRM_TITLE,
} from "@/lib/confirm-delete-dialog-copy";
import {
  googleCalendarPanelCardClass,
  googleCalendarPanelCardContentClass,
} from "@/lib/google-calendar-ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  isConnected: boolean;
  listBodyLoading: boolean;
  isDisconnecting: boolean;
  /** Resolve when disconnect succeeds — confirm closes only after this settles. */
  onDisconnect: () => void | Promise<void>;
};

/** Sky glass — OAuth connect/disconnect; card chrome stays mounted while status pulses. */
export function GoogleCalendarConnectionCard({
  isConnected,
  listBodyLoading,
  isDisconnecting,
  onDisconnect,
}: Props) {
  const [disconnectConfirmOpen, setDisconnectConfirmOpen] = useState(false);

  return (
    <Card className={cn(googleCalendarPanelCardClass("sky"), "gap-0")}>
      <CardContent className={googleCalendarPanelCardContentClass}>
        <PortalPanelSubsectionHeader
          title="Connection Status"
          subtitle={
            listBodyLoading
              ? undefined
              : isConnected
                ? "Your Google Calendar is linked. Push sync runs per appointment; events preview below."
                : "Connect Google Calendar to sync appointments and preview Google events."
          }
          icon={CalendarCheck2}
          iconClassName="border-sky-100 bg-sky-50 [&_svg]:text-sky-600"
          statusChip={
            listBodyLoading ? undefined : (
              <GoogleCalendarConnectionGlassBadge connected={isConnected} />
            )
          }
          statusChipSkeleton={listBodyLoading}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {listBodyLoading ? (
            <Skeleton className="h-9 w-52 rounded-xl" />
          ) : !isConnected ? (
            <Link
              href="/api/calendar/connect"
              className={cn(skyGlassPrimaryButtonClass, "inline-flex items-center gap-2 no-underline")}
            >
              <CalendarCheck2 className="h-4 w-4" aria-hidden />
              Connect Google Calendar
              <ExternalLink className="h-3.5 w-3.5 opacity-80" aria-hidden />
            </Link>
          ) : (
            <>
              <ControlPanelGlassActionButton
                variant="rose"
                disabled={isDisconnecting}
                onClick={() => setDisconnectConfirmOpen(true)}
              >
                <CalendarX2 className="h-4 w-4" aria-hidden />
                {isDisconnecting ? "Disconnecting…" : "Disconnect"}
              </ControlPanelGlassActionButton>
              <ConfirmActionDialog
                open={disconnectConfirmOpen}
                onOpenChange={setDisconnectConfirmOpen}
                variant="warning"
                title={DISCONNECT_GOOGLE_CALENDAR_CONFIRM_TITLE}
                subtitle={buildGoogleCalendarDisconnectConfirmSubtitle()}
                confirmLabel="Disconnect"
                cancelLabel="Cancel"
                confirmPending={isDisconnecting}
                confirmPendingLabel="Disconnecting…"
                onConfirm={async () => {
                  await onDisconnect();
                  setDisconnectConfirmOpen(false);
                }}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
