import { ADMIN_PORTAL_APPOINTMENTS_PAGE_SIZE } from "@/lib/admin-portal-load";

export type AdminPortalPaginationResult<T> = {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  items: T[];
};

/** Client-only slice — no network on page change. */
export function paginateAdminPortalAppointments<T>(
  items: readonly T[],
  page: number,
  pageSize: number = ADMIN_PORTAL_APPOINTMENTS_PAGE_SIZE
): AdminPortalPaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    pageSize,
    totalPages,
    totalItems,
    items: items.slice(start, start + pageSize),
  };
}
