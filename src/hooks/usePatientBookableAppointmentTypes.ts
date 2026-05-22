"use client";

/**
 * Patient booking visit types: enabled globals + doctor-owned/custom only.
 * Seeds from `queryKeys.doctors.all` while `appointmentTypes.byDoctor` loads — no empty flash.
 */

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import {
  filterBookableTypesForDoctorFromApi,
  mapApiBookableToPatientBookingType,
  mapDirectoryBookableToPatientBookingType,
  type AppointmentTypeDoctorApiRow,
} from "@/lib/doctor-bookable-types";
import { resolveDoctorBookableTypes } from "@/lib/doctor-directory";
import type { DoctorDirectoryRow } from "@/lib/doctor-directory";
import type { PatientBookingAppointmentType } from "@/lib/patient-booking-wizard";
import { APPOINTMENT_TYPES_PREFETCH_STALE_MS } from "@/lib/prefetch-appointment-types";

export function usePatientBookableAppointmentTypes(opts: {
  doctorId: string;
  enabled: boolean;
  doctors: DoctorDirectoryRow[];
}): {
  types: PatientBookingAppointmentType[];
  typesLoading: boolean;
  isFlexible: boolean;
} {
  const { doctorId, enabled, doctors } = opts;

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.appointmentTypes.byDoctor(doctorId),
    queryFn: () =>
      apiClient<{ types: AppointmentTypeDoctorApiRow[] }>(
        `/api/appointment-types?doctorId=${encodeURIComponent(doctorId)}`
      ),
    enabled: enabled && Boolean(doctorId),
    staleTime: APPOINTMENT_TYPES_PREFETCH_STALE_MS,
  });

  let types: PatientBookingAppointmentType[] = [];
  let source: "api" | "directory" | "none" = "none";
  if (doctorId) {
    if (data?.types) {
      source = "api";
      types = filterBookableTypesForDoctorFromApi(doctorId, data.types).map(
        mapApiBookableToPatientBookingType
      );
    } else {
      const row = doctors.find((d) => d.id === doctorId);
      if (row) {
        source = "directory";
        types = resolveDoctorBookableTypes(row).map((t) =>
          mapDirectoryBookableToPatientBookingType(doctorId, t)
        );
      }
    }
  }

  // #region agent log
  if (enabled && doctorId) {
    fetch("http://127.0.0.1:7938/ingest/15849825-35e9-4832-9975-ca3563c056ec", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "6e525f" },
      body: JSON.stringify({
        sessionId: "6e525f",
        hypothesisId: "H4",
        location: "usePatientBookableAppointmentTypes.ts",
        message: "patient bookable types resolved",
        data: {
          doctorId,
          source,
          apiRawLen: data?.types?.length ?? null,
          typesLen: types.length,
          globalCount: types.filter((t) => t.is_global).length,
          isLoading,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }
  // #endregion

  /** Skeleton only when there is no directory seed and the per-doctor types query is still loading. */
  const typesLoading = Boolean(doctorId) && isLoading && types.length === 0;

  const isFlexible = !typesLoading && types.length === 0 && Boolean(doctorId);

  return { types, typesLoading, isFlexible };
}
