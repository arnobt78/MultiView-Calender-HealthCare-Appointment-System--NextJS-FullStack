"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AppointmentTypeDoctorApiRow } from "@/lib/doctor-bookable-types";
import {
  partitionTelehealthTypesForDoctorFromApi,
  resolveDefaultTelehealthTypeId,
} from "@/lib/telehealth-scheduling-types";
import { isValidUUID } from "@/lib/validation";

type AppointmentTypesResponse = {
  types: AppointmentTypeDoctorApiRow[];
};

/**
 * Telehealth queue booking preset — raw API rows partitioned into selectable + inactive display.
 * Never enters flexible mode (telehealth preset requires explicit visit types).
 */
export function useTelehealthSchedulingTypesForDoctor(
  doctorId: string | null | undefined
) {
  const enabled = isValidUUID(doctorId ?? "");

  const query = useQuery({
    queryKey: queryKeys.appointmentTypes.byDoctor(doctorId ?? ""),
    queryFn: () =>
      apiClient<AppointmentTypesResponse>(
        `/api/appointment-types?doctorId=${encodeURIComponent(doctorId!)}`
      ),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const partition = useMemo(() => {
    const raw = query.data?.types ?? [];
    if (!enabled || !doctorId) {
      return { selectable: [] as AppointmentTypeDoctorApiRow[], inactiveDisplay: [] as AppointmentTypeDoctorApiRow[] };
    }
    return partitionTelehealthTypesForDoctorFromApi(doctorId, raw);
  }, [query.data?.types, doctorId, enabled]);

  const defaultTypeId = useMemo(
    () => resolveDefaultTelehealthTypeId(partition.selectable),
    [partition.selectable]
  );

  return {
    types: partition.selectable,
    inactiveTypes: partition.inactiveDisplay,
    typesLoading: query.isLoading,
    /** Telehealth preset never uses flexible booking. */
    isStaffFlexible: false,
    defaultTypeId,
  };
}
