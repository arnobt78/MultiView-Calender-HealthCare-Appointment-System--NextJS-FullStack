"use client";

/**
 * CP doctor detail — global visit-type toggles (shared editor; admin-only invalidates adminPortal).
 */

import { DoctorGlobalVisitTypesEditor } from "@/components/shared/doctor-settings";

type Props = {
  doctorId: string;
};

export function DoctorGlobalTypeConfigEditor({ doctorId }: Props) {
  return <DoctorGlobalVisitTypesEditor doctorId={doctorId} variant="control-panel" />;
}
