"use client";

/**
 * CP doctor detail — doctor-owned appointment types (shared editor).
 */

import { DoctorVisitTypesSettings } from "@/components/shared/doctor-settings";

type Props = {
  doctorId: string;
};

export function DoctorAppointmentTypesEditor({ doctorId }: Props) {
  return <DoctorVisitTypesSettings doctorId={doctorId} variant="control-panel" section="additional" />;
}
