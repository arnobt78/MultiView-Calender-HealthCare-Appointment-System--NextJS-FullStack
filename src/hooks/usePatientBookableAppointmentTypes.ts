"use client";

/**
 * Patient booking visit types: enabled globals + doctor-owned/custom only.
 * Seeds from `queryKeys.doctors.all` while `appointmentTypes.byDoctor` loads — no empty flash.
 * `telehealthOnly` — telehealth queue preset: partition enabled vs inactive display (REQ-0091).
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
import { partitionTelehealthTypesForDoctorFromApi } from "@/lib/telehealth-scheduling-types";

export function usePatientBookableAppointmentTypes(opts: {
  doctorId: string;
  enabled: boolean;
  doctors: DoctorDirectoryRow[];
  telehealthOnly?: boolean;
}): {
  types: PatientBookingAppointmentType[];
  inactiveTypes: PatientBookingAppointmentType[];
  typesLoading: boolean;
  isFlexible: boolean;
} {
  const { doctorId, enabled, doctors, telehealthOnly = false } = opts;

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
  let inactiveTypes: PatientBookingAppointmentType[] = [];

  if (doctorId) {
    if (data?.types) {
      if (telehealthOnly) {
        const partition = partitionTelehealthTypesForDoctorFromApi(doctorId, data.types);
        types = partition.selectable.map(mapApiBookableToPatientBookingType);
        inactiveTypes = partition.inactiveDisplay.map(mapApiBookableToPatientBookingType);
      } else {
        types = filterBookableTypesForDoctorFromApi(doctorId, data.types).map(
          mapApiBookableToPatientBookingType
        );
      }
    } else {
      const row = doctors.find((d) => d.id === doctorId);
      if (row) {
        types = resolveDoctorBookableTypes(row)
          .map((t) => mapDirectoryBookableToPatientBookingType(doctorId, t))
          .filter((t) => !telehealthOnly || t.is_telehealth);
      }
    }
  }

  /** Skeleton only when there is no directory seed and the per-doctor types query is still loading. */
  const typesLoading = Boolean(doctorId) && isLoading && types.length === 0;

  /** Telehealth preset never uses flexible booking. */
  const isFlexible =
    !telehealthOnly && !typesLoading && types.length === 0 && Boolean(doctorId);

  return { types, inactiveTypes, typesLoading, isFlexible };
}
