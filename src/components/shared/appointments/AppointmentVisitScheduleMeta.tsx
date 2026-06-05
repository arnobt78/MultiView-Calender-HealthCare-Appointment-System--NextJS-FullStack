"use client";

import type { ReactNode } from "react";
import { Clock3, MapPin } from "lucide-react";
import { AppointmentCardMetaRow } from "@/components/shared/AppointmentCardMetaRow";
import { TelehealthSessionBadge } from "@/components/shared/appointments/TelehealthSessionBadge";
import { portalAppointmentWhenWhereClass } from "@/lib/appointment-card";
import { resolveAppointmentVisitLocationLabel } from "@/lib/appointment-visit-location";
import { cn } from "@/lib/utils";

type Props = {
  /** Preformatted datetime line (cards/booking). */
  dateTimeLabel: ReactNode;
  location?: string | null;
  office_location?: string | null;
  is_telehealth?: boolean;
  /** Show telehealth chip beside when/where (portal timeline header uses separate badge). */
  showTelehealthBadge?: boolean;
  className?: string;
};

/**
 * When + where row cluster — portal timeline, booking steps 2/3, shared card meta.
 */
export function AppointmentVisitScheduleMeta({
  dateTimeLabel,
  location,
  office_location,
  is_telehealth = false,
  showTelehealthBadge = false,
  className,
}: Props) {
  const locationLabel = resolveAppointmentVisitLocationLabel({
    location,
    office_location,
    is_telehealth,
  });

  return (
    <div className={cn(portalAppointmentWhenWhereClass, className)}>
      <AppointmentCardMetaRow icon={<Clock3 className="h-3.5 w-3.5" />}>
        <span className="font-medium text-gray-700">{dateTimeLabel}</span>
      </AppointmentCardMetaRow>
      {locationLabel ? (
        <AppointmentCardMetaRow icon={<MapPin className="h-3.5 w-3.5" />}>
          <span className="font-medium text-gray-700">{locationLabel}</span>
        </AppointmentCardMetaRow>
      ) : null}
      {showTelehealthBadge && is_telehealth ? <TelehealthSessionBadge /> : null}
    </div>
  );
}
