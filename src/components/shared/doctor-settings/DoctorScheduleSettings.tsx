"use client";

/**
 * Composes weekly availability + time off — CP uses Card shells; portal uses bare editors inside PortalPanelSection.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CalendarOff } from "lucide-react";
import type { DoctorSettingsVariant } from "@/lib/doctor-schedule-types";
import { DoctorWeeklyScheduleEditor } from "@/components/shared/doctor-settings/DoctorWeeklyScheduleEditor";
import { DoctorTimeOffEditor } from "@/components/shared/doctor-settings/DoctorTimeOffEditor";

type Props = {
  doctorId: string;
  variant?: DoctorSettingsVariant;
};

export function DoctorScheduleSettings({ doctorId, variant = "control-panel" }: Props) {
  if (variant === "portal") {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-sky-600" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DoctorWeeklyScheduleEditor doctorId={doctorId} variant="control-panel" showSummaryPreview={false} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarOff className="h-4 w-4 text-amber-600" />
            Time Off
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DoctorTimeOffEditor doctorId={doctorId} variant="control-panel" />
        </CardContent>
      </Card>
    </>
  );
}
