"use client";

import { RefreshCw, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PortalPanelSubsectionHeader } from "@/components/shared/PortalPanelSubsectionHeader";
import { ControlPanelGlassActionButton } from "@/components/shared/ControlPanelGlassActionButton";
import {
  googleCalendarPanelCardClass,
  googleCalendarPanelCardContentClass,
} from "@/lib/google-calendar-ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  isConnected: boolean;
  isFetching: boolean;
  onRefresh: () => void;
};

/** Sky info card — honest sync copy + manual refresh when connected. */
export function GoogleCalendarSyncInfoCard({ isConnected, isFetching, onRefresh }: Props) {
  if (!isConnected) return null;

  return (
    <Card className={cn(googleCalendarPanelCardClass("sky"), "gap-0")}>
      <CardContent className={googleCalendarPanelCardContentClass}>
        <PortalPanelSubsectionHeader
          title="Sync Behavior"
          subtitle="New and updated appointments auto-sync when Google Calendar is connected. Cancelled or deleted visits remove the linked Google event. Use the appointment ⋮ menu or detail footer to push manually. Pull loads the preview table above."
          icon={Info}
          iconClassName="border-sky-100 bg-sky-50 [&_svg]:text-sky-600"
          // Page-header parity: title + subtitle stack left; refresh action right (no flex gap between title rows).
          headerActionsSeparateRow
          headerActions={
            <ControlPanelGlassActionButton
              variant="sky"
              disabled={isFetching}
              onClick={onRefresh}
            >
              <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} aria-hidden />
              {isFetching ? "Refreshing…" : "Refresh Events"}
            </ControlPanelGlassActionButton>
          }
        />
      </CardContent>
    </Card>
  );
}
