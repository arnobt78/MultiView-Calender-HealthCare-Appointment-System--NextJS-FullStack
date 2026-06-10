"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { DoctorsDirectoryResponse } from "@/lib/doctor-directory";
import { queryKeys } from "@/lib/query-keys";

const DOCTORS_DIRECTORY_STALE_MS = 5 * 60 * 1000;

export type UseDoctorsDirectoryOptions = {
  enabled?: boolean;
  /** SSR seed — avoids duplicate fetch when CP layout/section prefetched directory. */
  directoryInitialData?: DoctorsDirectoryResponse;
};

/**
 * Doctor directory for patient booking picker + `/services`.
 * Invalidates via `invalidateUsersAndAuth` / `invalidateDoctorSchedule` → `doctors.all`.
 */
export function useDoctorsDirectory(options?: UseDoctorsDirectoryOptions) {
  const queryClient = useQueryClient();

  const directoryInitialData =
    options?.directoryInitialData ??
    queryClient.getQueryData<DoctorsDirectoryResponse>(queryKeys.doctors.all);

  return useQuery({
    queryKey: queryKeys.doctors.all,
    queryFn: () => apiClient<DoctorsDirectoryResponse>("/api/doctors"),
    initialData: directoryInitialData,
    staleTime: DOCTORS_DIRECTORY_STALE_MS,
    enabled: options?.enabled ?? true,
    refetchOnMount: directoryInitialData !== undefined ? false : true,
  });
}
