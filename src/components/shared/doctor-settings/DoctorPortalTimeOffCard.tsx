"use client";

/**
 * Doctor portal — unavailable dates (pairs with Additional Appointment Types in `lg:grid-cols-2`).
 */

import { CalendarOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
import type { TimeOffBlock } from "@/lib/doctor-schedule-types";
import { queryKeys } from "@/lib/query-keys";
import { apiClient } from "@/lib/api-client";

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
  const { data: timeOffData } = useQuery({
    queryKey: queryKeys.doctors.timeOff(doctorId ?? ""),
    queryFn: () =>
      apiClient<{ timeOff: TimeOffBlock[] }>(
        `/api/doctor-time-off?doctorId=${encodeURIComponent(doctorId!)}`
      ),
    enabled: Boolean(doctorId),
    initialData: initialTimeOff,
    staleTime: 60_000,
  });
  const timeOffCount = timeOffData?.timeOff?.length ?? 0;
  const countSkeleton = Boolean(portalLoading || !doctorId);

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
              count={timeOffCount}
              countSkeleton={countSkeleton}
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
