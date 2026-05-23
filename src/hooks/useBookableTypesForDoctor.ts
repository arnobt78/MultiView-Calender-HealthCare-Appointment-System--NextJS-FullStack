"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  filterBookableTypesForDoctorFromApi,
  type AppointmentTypeDoctorApiRow,
} from "@/lib/doctor-bookable-types";
import { isValidUUID } from "@/lib/validation";

type AppointmentTypesResponse = {
  types: AppointmentTypeDoctorApiRow[];
};

/**
 * Bookable visit types for a doctor (owned + enabled globals) — staff scheduling dialog.
 */
export function useBookableTypesForDoctor(doctorId: string | null | undefined) {
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

  const types: AppointmentTypeDoctorApiRow[] = useMemo(() => {
    const raw = query.data?.types ?? [];
    if (!enabled || !doctorId) return raw;
    return filterBookableTypesForDoctorFromApi(doctorId, raw);
  }, [query.data?.types, doctorId, enabled]);

  const isStaffFlexible = !query.isLoading && types.length === 0 && enabled;

  return {
    types,
    typesLoading: query.isLoading,
    isStaffFlexible,
  };
}
