import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { isValidUUID } from "@/lib/validation";
import type { Category, Patient, PatientSnapshot, User } from "@/types/types";

/**
 * Warm TanStack caches before navigation (hover/focus) — best-effort, no throw to UI.
 * Supports control-panel and portal detail paths (`/patients/:id`, `/categories/:id`, etc.).
 */
export function prefetchQueriesForControlPanelHref(
  queryClient: QueryClient,
  href: string
): void {
  const path = href.split("?")[0] ?? href;
  const segments = path.split("/").filter(Boolean);
  const last = segments.pop();
  if (!last || !isValidUUID(last)) return;

  const id = last;
  const isPatients = segments.includes("patients");
  const isDoctors = segments.includes("doctors");
  const isCategories = segments.includes("categories");

  const run = async () => {
    try {
      if (isPatients) {
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
      if (isDoctors) {
        await queryClient.prefetchQuery({
          queryKey: queryKeys.users.detail(id),
          queryFn: async () => {
            const res = await apiClient<{ user: User }>(`/api/users/${id}`);
            return res.user;
          },
        });
        return;
      }
      if (isCategories) {
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
