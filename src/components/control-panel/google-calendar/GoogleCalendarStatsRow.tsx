"use client";

import { CalendarCheck2, CalendarClock, CalendarDays, Link2 } from "lucide-react";
import { PatientStatCard } from "@/components/control-panel/PatientStatCard";
import {
  googleCalendarConnectionConnectedValueClass,
  googleCalendarConnectionDisconnectedValueClass,
} from "@/lib/google-calendar-ui-classes";
import { isGoogleCalendarStatsSkeleton } from "@/lib/google-calendar-status-ui";

type Props = {
  isConnected: boolean;
  eventCount: number;
  upcomingCount: number;
  listBodyLoading: boolean;
};

/** Display-only KPI strip — skeleton only on cold load, not background refetch. */
export function GoogleCalendarStatsRow({
  isConnected,
  eventCount,
  upcomingCount,
  listBodyLoading,
}: Props) {
  const skeleton = isGoogleCalendarStatsSkeleton(listBodyLoading);

  return (
    <div className="grid grid-cols-1 gap-2 overflow-visible sm:grid-cols-2 lg:grid-cols-4">
      <PatientStatCard
        variant="sky"
        icon={CalendarCheck2}
        title="Connection"
        subtitle="Google Account Link"
        value={isConnected ? 1 : 0}
        valueDisplay={isConnected ? "Connected" : "Not connected"}
        valueClassName={
          isConnected
            ? googleCalendarConnectionConnectedValueClass
            : googleCalendarConnectionDisconnectedValueClass
        }
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="violet"
        icon={CalendarDays}
        title="Events"
        subtitle="Loaded From Google"
        value={eventCount}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="emerald"
        icon={CalendarClock}
        title="Upcoming"
        subtitle="Next 7 Days"
        value={upcomingCount}
        valueSkeleton={skeleton}
      />
      <PatientStatCard
        variant="violet"
        icon={Link2}
        title="Calendar"
        subtitle="Synced Calendar Id"
        value={isConnected ? 1 : 0}
        valueDisplay={isConnected ? "primary" : "—"}
        valueSkeleton={skeleton}
      />
    </div>
  );
}
