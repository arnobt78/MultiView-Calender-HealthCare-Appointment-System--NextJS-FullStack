import type { QueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { isValidUUID } from "@/lib/validation";
import type {
  Category,
  CategorySnapshot,
  DoctorSnapshot,
  Patient,
  PatientSnapshot,
  User,
} from "@/types/types";
import { prefetchCategoryDetailStaffUsers } from "@/lib/prefetch-category-detail-staff";
import { mapApiInvoiceToRow } from "@/lib/billing-invoice-map";
import type { InvoiceRow } from "@/lib/billing-types";

type PrefetchViewer = { userId: string; role: string | null };

function getPrefetchViewer(queryClient: QueryClient): PrefetchViewer | undefined {
  const me = queryClient.getQueryData<{ id: string; role?: string } | null>(queryKeys.auth.me);
  if (!me?.id) return undefined;
  return { userId: me.id, role: me.role ?? null };
}

async function prefetchInvoiceDetailQuery(
  queryClient: QueryClient,
  invoiceId: string
): Promise<void> {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.invoices.detail(invoiceId),
    queryFn: async () => {
      const res = await apiClient<{ invoice: InvoiceRow }>(`/api/invoices/${invoiceId}`);
      return mapApiInvoiceToRow(res.invoice);
    },
  });
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
  const isAdmins = segments.includes("admins");
  const isCategories = segments.includes("categories");
  /** Portal `/invoices/:id` and CP `/control-panel/invoices/:id` share the same detail API. */
  const isInvoices = segments.includes("invoices");
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
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: queryKeys.users.detail(id),
            queryFn: async () => {
              const res = await apiClient<{ user: User }>(`/api/users/${id}`);
              return res.user;
            },
          }),
          queryClient.prefetchQuery({
            queryKey: queryKeys.doctors.snapshot(id),
            queryFn: () => apiClient<DoctorSnapshot>(`/api/doctors/${id}/snapshot`),
          }),
        ]);
        return;
      }
      if (isAdmins) {
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
          prefetchCategoryDetailStaffUsers(queryClient, resolvedViewer?.role),
        ]);
        return;
      }
      if (isInvoices) {
        await prefetchInvoiceDetailQuery(queryClient, id);
        return;
      }
    } catch {
      /* ignore — prefetch only */
    }
  };

  void run();
}

/** Alias — portal + control-panel detail href prefetch. */
export const prefetchQueriesForDetailHref = prefetchQueriesForControlPanelHref;
