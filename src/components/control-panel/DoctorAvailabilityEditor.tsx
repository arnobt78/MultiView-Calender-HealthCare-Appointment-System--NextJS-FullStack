"use client";

/**
 * CP doctor detail — weekly schedule + time off (shared `DoctorScheduleSettings`).
 */

import { DoctorScheduleSettings } from "@/components/shared/doctor-settings";

interface DoctorAvailabilityEditorProps {
  doctorId: string;
}

export function DoctorAvailabilityEditor({ doctorId }: DoctorAvailabilityEditorProps) {
  return <DoctorScheduleSettings doctorId={doctorId} variant="control-panel" />;
}
