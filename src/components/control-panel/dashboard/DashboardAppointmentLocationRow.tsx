"use client";

import { MapPin } from "lucide-react";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { DashboardMetaIconRow } from "@/components/control-panel/dashboard/DashboardMetaIconRow";
import { controlPanelDashboardScheduleMetaRowClass } from "@/lib/control-panel-glass-card";
import { cn } from "@/lib/utils";

type Props = {
  location: string | null;
  isTelehealth?: boolean;
  className?: string;
};

/** Location + telehealth only (when datetime is rendered separately). */
export function DashboardAppointmentLocationRow({
  location,
  isTelehealth = false,
  className,
}: Props) {
  if (!location?.trim() && !isTelehealth) return null;
  return (
    <div className={cn(controlPanelDashboardScheduleMetaRowClass, className)}>
      {location?.trim() ? (
        <DashboardMetaIconRow icon={MapPin}>{location.trim()}</DashboardMetaIconRow>
      ) : null}
      {isTelehealth ? <TelehealthSessionBadge /> : null}
    </div>
  );
}
