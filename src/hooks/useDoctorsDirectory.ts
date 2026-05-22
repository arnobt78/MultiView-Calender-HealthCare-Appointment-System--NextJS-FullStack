"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { DoctorsDirectoryResponse } from "@/lib/doctor-directory";
import { queryKeys } from "@/lib/query-keys";

const DOCTORS_DIRECTORY_STALE_MS = 5 * 60 * 1000;

/**
 * Doctor directory for patient booking picker + `/services`.
 * Invalidates via `invalidateUsersAndAuth` / `invalidateDoctorSchedule` → `doctors.all`.
 */
export function useDoctorsDirectory(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.doctors.all,
    queryFn: () => apiClient<DoctorsDirectoryResponse>("/api/doctors"),
    staleTime: DOCTORS_DIRECTORY_STALE_MS,
    enabled: options?.enabled ?? true,
  });
}
