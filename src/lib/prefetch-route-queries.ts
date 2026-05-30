import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { isValidUUID } from "@/lib/validation";
import { isAdminRole } from "@/lib/rbac";
import type { Category, Patient, PatientSnapshot, User, CategorySnapshot } from "@/types/types";

type PrefetchViewer = { userId: string; role: string | null };

function getPrefetchViewer(queryClient: QueryClient): PrefetchViewer | undefined {
  const me = queryClient.getQueryData<{ id: string; role?: string } | null>(queryKeys.auth.me);
  if (!me?.id) return undefined;
  return { userId: me.id, role: me.role ?? null };
}

function rosterQueryFromHref(href: string): string {
  const q = href.includes("?") ? href.split("?")[1] : "";
  if (!q) return "";
  const fromDoctor = new URLSearchParams(q).get("fromDoctor");
  if (!fromDoctor || !isValidUUID(fromDoctor)) return "";
  return `?fromDoctor=${encodeURIComponent(fromDoctor)}`;
}

/**
 * Warm TanStack caches before navigation (hover/focus) — best-effort, no throw to UI.
 * Supports control-panel and portal detail paths (`/patients/:id`, `/categories/:id`, etc.).
 */
export function prefetchQueriesForControlPanelHref(
  queryClient: QueryClient,
  href: string,
  viewer?: PrefetchViewer
): void {
  const path = href.split("?")[0] ?? href;
  const segments = path.split("/").filter(Boolean);
  const last = segments.pop();
  if (!last || !isValidUUID(last)) return;

  const id = last;
  const isPatients = segments.includes("patients");
  const isDoctors = segments.includes("doctors");
  const isCategories = segments.includes("categories");
  const resolvedViewer = viewer ?? getPrefetchViewer(queryClient);
  const rosterQ = rosterQueryFromHref(href);

  const run = async () => {
    try {
      if (isPatients) {
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: queryKeys.patients.detail(id),
            queryFn: async () => {
              const res = await apiClient<{ patient: Patient }>(`/api/patients/${id}${rosterQ}`);
              return res.patient;
            },
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.patients.snapshot(id),
            queryFn: () => apiClient<PatientSnapshot>(`/api/patients/${id}/snapshot${rosterQ}`),
          }),
        ]);
        return;
      }
      if (isDoctors) {
        const role = resolvedViewer?.role ?? null;
        const canPrefetchUser =
          isAdminRole(role) || (resolvedViewer && id === resolvedViewer.userId);
        if (!canPrefetchUser) return;
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
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: queryKeys.categories.detail(id),
            queryFn: async () => {
              const res = await apiClient<{ category: Category }>(`/api/categories/${id}`);
              return res.category;
            },
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.categories.snapshot(id),
            queryFn: () => apiClient<CategorySnapshot>(`/api/categories/${id}/snapshot`),
          }),
        ]);
      }
    } catch {
      /* ignore — prefetch only */
    }
  };

  void run();
}

/** Alias — portal + control-panel detail href prefetch. */
export const prefetchQueriesForDetailHref = prefetchQueriesForControlPanelHref;
