import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { isValidUUID } from "@/lib/validation";
import type { Category, Patient, PatientSnapshot, User } from "@/types/types";

/**
 * Warm TanStack caches before navigation (hover/focus) — best-effort, no throw to UI.
 * Matches hooks: usePatient, usePatientSnapshot, useUser, useCategory.
 */
export function prefetchQueriesForControlPanelHref(
  queryClient: QueryClient,
  href: string
): void {
  const path = href.split("?")[0] ?? href;
  const last = path.split("/").filter(Boolean).pop();
  if (!last || !isValidUUID(last)) return;

  const id = last;

  const run = async () => {
    try {
      if (path.includes("/control-panel/patients/")) {
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: queryKeys.patients.detail(id),
            queryFn: async () => {
              const res = await apiClient<{ patient: Patient }>(`/api/patients/${id}`);
              return res.patient;
            },
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.patients.snapshot(id),
            queryFn: () => apiClient<PatientSnapshot>(`/api/patients/${id}/snapshot`),
          }),
        ]);
        return;
      }
      if (path.includes("/control-panel/doctors/")) {
        await queryClient.prefetchQuery({
          queryKey: queryKeys.users.detail(id),
          queryFn: async () => {
            const res = await apiClient<{ user: User }>(`/api/users/${id}`);
            return res.user;
          },
        });
        return;
      }
      if (path.includes("/control-panel/categories/")) {
        await queryClient.prefetchQuery({
          queryKey: queryKeys.categories.detail(id),
          queryFn: async () => {
            const res = await apiClient<{ category: Category }>(`/api/categories/${id}`);
            return res.category;
          },
        });
      }
    } catch {
      /* ignore — prefetch only */
    }
  };

  void run();
}
