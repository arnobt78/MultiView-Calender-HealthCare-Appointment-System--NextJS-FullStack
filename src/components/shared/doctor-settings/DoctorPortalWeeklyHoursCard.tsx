"use client";

/**
 * Doctor portal — weekly hours only (pairs with Patient Visit Types in `lg:grid-cols-2`).
 */

import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { portalPanelCardClass } from "@/components/shared/PortalPanelSection";
import { PortalPanelSubsectionHeader } from "@/components/shared/PortalPanelSubsectionHeader";
import { DoctorWeeklyScheduleEditor } from "@/components/shared/doctor-settings/DoctorWeeklyScheduleEditor";
import { WeeklyHoursPortalSubtitle } from "@/components/shared/doctor-settings/WeeklyHoursPortalSubtitle";
import { WEEKLY_HOURS_SECTION_TITLE } from "@/lib/doctor-portal-schedule-copy";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";
import { sharedAvailabilityTimezone } from "@/lib/doctor-schedule-display";
import type { DoctorAvailabilityQueryData } from "@/lib/doctor-portal-settings-prefetch";
import type { AvailabilityWindow } from "@/lib/doctor-schedule-types";

type Props = {
  doctorId: string | undefined;
  portalLoading?: boolean;
  initialAvailability?: DoctorAvailabilityQueryData;
};

export function DoctorPortalWeeklyHoursCard({
  doctorId,
  portalLoading,
  initialAvailability,
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
  const weeklyHoursCount = availData?.availability?.length ?? 0;
  const countSkeleton = Boolean(portalLoading || !doctorId);

  return (
    <Card id="dp-weekly-hours" className={portalPanelCardClass}>
      <CardContent className="p-4 text-gray-700">
        {portalLoading || !doctorId ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <section aria-labelledby="dp-weekly-hours-heading">
            <PortalPanelSubsectionHeader
              id="dp-weekly-hours-heading"
              title={WEEKLY_HOURS_SECTION_TITLE}
              subtitle={<WeeklyHoursPortalSubtitle timezone={singleTz} />}
              icon={Clock}
              iconClassName="border-sky-100 bg-sky-50 [&_svg]:text-sky-600"
              count={weeklyHoursCount}
              countSkeleton={countSkeleton}
            />
            <DoctorWeeklyScheduleEditor
              doctorId={doctorId}
              variant="portal"
              layout="collapsible"
              initialAvailability={initialAvailability}
            />
          </section>
        )}
      </CardContent>
    </Card>
  );
}
