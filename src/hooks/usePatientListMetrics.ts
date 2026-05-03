import { useMemo } from "react";
import type { Patient } from "@/types/types";

/** Derived counts for Patient Management stat cards — pure function of cached `patients` list (no extra HTTP). */
export type PatientListMetrics = {
  total: number;
  active: number;
  inactive: number;
  /** Patients with a documented 1–10 tier on file */
  withCareTier: number;
  /** Tier 7+ (high / intensive on the shared scale) */
  highAcuity: number;
};

export function usePatientListMetrics(patients: Patient[]): PatientListMetrics {
  return useMemo(() => {
    let active = 0;
    let inactive = 0;
    let withCareTier = 0;
    let highAcuity = 0;
    for (const p of patients) {
      if (p.active) active++;
      else inactive++;
      const cl = p.care_level;
      if (typeof cl === "number" && cl >= 1 && cl <= 10) {
        withCareTier += 1;
        if (cl >= 7) highAcuity += 1;
      }
    }
    return {
      total: patients.length,
      active,
      inactive,
      withCareTier,
      highAcuity,
    };
  }, [patients]);
}
