"use client";

import type { Patient } from "@/types/types";
import { ControlPanelSectionPageClient } from "@/components/control-panel/ControlPanelSectionPageClient";

type Props = {
  initialPatients: Patient[] | null;
};

/** @deprecated Use `ControlPanelSectionServerPage({ tab: "patients" })`. */
export function PatientManagementPageClient({ initialPatients }: Props) {
  return (
    <ControlPanelSectionPageClient
      tab="patients"
      initial={{ patients: initialPatients }}
    />
  );
}
