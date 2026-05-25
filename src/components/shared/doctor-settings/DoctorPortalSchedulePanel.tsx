"use client";

/**
 * Doctor portal — weekly hours + unavailable dates in one card (legacy combined layout).
 * Prefer `DoctorPortalWeeklyHoursCard` + `DoctorPortalTimeOffCard` on `/doctor-portal`.
 */

import { Clock, CalendarOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { portalPanelCardClass } from "@/components/shared/PortalPanelSection";
import { PortalPanelSubsectionHeader } from "@/components/shared/PortalPanelSubsectionHeader";
import { DoctorWeeklyScheduleEditor } from "@/components/shared/doctor-settings/DoctorWeeklyScheduleEditor";
import { DoctorTimeOffEditor } from "@/components/shared/doctor-settings/DoctorTimeOffEditor";
import {
  TIME_OFF_PORTAL_SUBTITLE,
  UNAVAILABLE_DATES_SECTION_TITLE,
  WEEKLY_HOURS_SECTION_TITLE,
} from "@/lib/doctor-portal-schedule-copy";
import { WeeklyHoursPortalSubtitle } from "@/components/shared/doctor-settings/WeeklyHoursPortalSubtitle";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";
import { sharedAvailabilityTimezone } from "@/lib/doctor-schedule-display";
import type {
  DoctorAvailabilityQueryData,
  DoctorTimeOffQueryData,
} from "@/lib/doctor-portal-settings-prefetch";
import type { AvailabilityWindow } from "@/lib/doctor-schedule-types";

type Props = {
  doctorId: string | undefined;
  /** True only while `doctorPortal.all` has no data (not schedule queries). */
  portalLoading?: boolean;
  initialAvailability?: DoctorAvailabilityQueryData;
  initialTimeOff?: DoctorTimeOffQueryData;
};

export function DoctorPortalSchedulePanel({
  doctorId,
  portalLoading,
  initialAvailability,
  initialTimeOff,
}: Props) {
  const { data: availData } = useQuery({
    queryKey: queryKeys.doctors.availability(doctorId ?? ""),
    queryFn: () =>
      apiClient<{ availability: AvailabilityWindow[] }>(
        `/api/doctor-availability?doctorId=${encodeURIComponent(doctorId!)}`
      ),
    enabled: Boolean(doctorId),
    initialData: initialAvailability,
    staleTime: 60_000,
  });
  const singleTz = sharedAvailabilityTimezone(availData?.availability ?? []);

  return (
    <Card id="dp-booking-schedule" className={portalPanelCardClass}>
      <CardContent className="p-4 text-gray-700 sm:p-6">
        {portalLoading || !doctorId ? (
          <div className="space-y-4">
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-6">
            <section aria-labelledby="dp-weekly-hours-heading">
              <PortalPanelSubsectionHeader
                id="dp-weekly-hours-heading"
                title={WEEKLY_HOURS_SECTION_TITLE}
                subtitle={<WeeklyHoursPortalSubtitle timezone={singleTz} />}
                icon={Clock}
                iconClassName="border-sky-100 bg-sky-50 [&_svg]:text-sky-600"
              />
              <DoctorWeeklyScheduleEditor
                doctorId={doctorId}
                variant="portal"
                layout="collapsible"
                initialAvailability={initialAvailability}
              />
            </section>

            <div className="border-t border-slate-200/80" role="separator" />

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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
