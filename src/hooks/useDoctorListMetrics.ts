import { useMemo } from "react";
import type { User } from "@/types/types";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import { isDoctorActive } from "@/lib/entity-active-status";

export type DoctorListMetrics = {
  total: number;
  active: number;
  inactive: number;
  withAvailability: number;
};

type DoctorMetricRow = User & { directory?: DoctorDirectoryRow };

/** Derived KPI counts from cached doctor list — no extra HTTP. */
export function useDoctorListMetrics(rows: DoctorMetricRow[]): DoctorListMetrics {
  return useMemo(() => {
    let active = 0;
    let inactive = 0;
    let withAvailability = 0;
    for (const row of rows) {
      if (isDoctorActive(row)) active++;
      else inactive++;
      if ((row.directory?.availabilities?.length ?? 0) > 0) withAvailability++;
    }
    return {
      total: rows.length,
      active,
      inactive,
      withAvailability,
    };
  }, [rows]);
}
