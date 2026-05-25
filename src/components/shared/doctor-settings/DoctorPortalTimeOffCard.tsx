"use client";

/**
 * Doctor portal — unavailable dates (pairs with Additional Appointment Types in `lg:grid-cols-2`).
 */

import { CalendarOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { portalPanelCardClass } from "@/components/shared/PortalPanelSection";
import { PortalPanelSubsectionHeader } from "@/components/shared/PortalPanelSubsectionHeader";
import { DoctorTimeOffEditor } from "@/components/shared/doctor-settings/DoctorTimeOffEditor";
import {
  TIME_OFF_PORTAL_SUBTITLE,
  UNAVAILABLE_DATES_SECTION_TITLE,
} from "@/lib/doctor-portal-schedule-copy";
import type { DoctorTimeOffQueryData } from "@/lib/doctor-portal-settings-prefetch";

type Props = {
  doctorId: string | undefined;
  portalLoading?: boolean;
  initialTimeOff?: DoctorTimeOffQueryData;
};

export function DoctorPortalTimeOffCard({
  doctorId,
  portalLoading,
  initialTimeOff,
}: Props) {
  return (
    <Card id="dp-unavailable-dates" className={portalPanelCardClass}>
      <CardContent className="p-4 text-gray-700 sm:p-6">
        {portalLoading || !doctorId ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <section aria-labelledby="dp-time-off-heading">
            <PortalPanelSubsectionHeader
              id="dp-time-off-heading"
              title={UNAVAILABLE_DATES_SECTION_TITLE}
              subtitle={TIME_OFF_PORTAL_SUBTITLE}
              icon={CalendarOff}
              iconClassName="border-amber-100 bg-amber-50 [&_svg]:text-amber-600"
            />
            <DoctorTimeOffEditor
              doctorId={doctorId}
              variant="portal"
              layout="collapsible"
              initialTimeOff={initialTimeOff}
            />
          </section>
        )}
      </CardContent>
    </Card>
  );
}
