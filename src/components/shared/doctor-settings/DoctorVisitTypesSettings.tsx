"use client";

/**
 * Composes additional + global visit types — use `section` when CP page splits Card shells.
 */

import type { DoctorSettingsVariant } from "@/lib/doctor-schedule-types";
import { DoctorAdditionalTypesEditor } from "@/components/shared/doctor-settings/DoctorAdditionalTypesEditor";
import { DoctorGlobalVisitTypesEditor } from "@/components/shared/doctor-settings/DoctorGlobalVisitTypesEditor";

type Props = {
  doctorId: string;
  variant?: DoctorSettingsVariant;
  section?: "additional" | "global";
};

export function DoctorVisitTypesSettings({
  doctorId,
  variant = "control-panel",
  section,
}: Props) {
  if (section === "additional") {
    return <DoctorAdditionalTypesEditor doctorId={doctorId} variant={variant} />;
  }
  if (section === "global") {
    return <DoctorGlobalVisitTypesEditor doctorId={doctorId} variant={variant} />;
  }
  return (
    <>
      <DoctorAdditionalTypesEditor doctorId={doctorId} variant={variant} />
      <DoctorGlobalVisitTypesEditor doctorId={doctorId} variant={variant} />
    </>
  );
}
