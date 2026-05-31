import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { DoctorAssignedPatientRow } from "@/lib/doctor-assigned-patients";

export type UseDoctorAssignedPatientsOptions = {
  /** SSR seed — table renders on first paint without client fetch flash. */
  initialData?: DoctorAssignedPatientRow[];
};

/** Primary-doctor roster on CP doctor detail — busted on patient CRUD. */
export function useDoctorAssignedPatients(
  doctorId: string,
  options?: UseDoctorAssignedPatientsOptions
) {
  return useQuery({
    queryKey: queryKeys.doctors.assignedPatients(doctorId),
    queryFn: async () => {
      const res = await apiClient<{ patients: DoctorAssignedPatientRow[] }>(
        `/api/doctors/${doctorId}/assigned-patients`
      );
      return res.patients;
    },
    enabled: Boolean(doctorId),
    initialData: options?.initialData,
    staleTime: 30_000,
  });
}
