import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { DoctorSnapshot } from "@/types/types";

export type UseDoctorSnapshotOptions = {
  /** SSR seed — related appointments render on first paint without client fetch flash. */
  initialData?: DoctorSnapshot | null;
};

/** Related appointments on doctor detail — busted on appointment/user CRUD. */
export function useDoctorSnapshot(doctorId: string, options?: UseDoctorSnapshotOptions) {
  return useQuery({
    queryKey: queryKeys.doctors.snapshot(doctorId),
    queryFn: () => apiClient<DoctorSnapshot>(`/api/doctors/${doctorId}/snapshot`),
    enabled: Boolean(doctorId),
    initialData: options?.initialData ?? undefined,
    staleTime: 60_000,
  });
}
