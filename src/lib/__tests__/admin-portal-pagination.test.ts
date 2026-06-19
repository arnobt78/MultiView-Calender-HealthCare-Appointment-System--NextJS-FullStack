import { describe, expect, it } from "vitest";
import { paginateAdminPortalAppointments } from "@/lib/admin-portal-pagination";
import { ADMIN_PORTAL_APPOINTMENTS_PAGE_SIZE } from "@/lib/admin-portal-load";

describe("paginateAdminPortalAppointments", () => {
  const items = Array.from({ length: 30 }, (_, i) => `item-${i}`);

  it("returns first page of 25 by default", () => {
    const result = paginateAdminPortalAppointments(items, 1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(ADMIN_PORTAL_APPOINTMENTS_PAGE_SIZE);
    expect(result.totalItems).toBe(30);
    expect(result.totalPages).toBe(2);
    expect(result.items).toHaveLength(25);
    expect(result.items[0]).toBe("item-0");
    expect(result.items[24]).toBe("item-24");
  });

  it("returns second page slice without extra items", () => {
    const result = paginateAdminPortalAppointments(items, 2);
    expect(result.page).toBe(2);
    expect(result.items).toHaveLength(5);
    expect(result.items[0]).toBe("item-25");
  });

  it("clamps page below 1 and above totalPages", () => {
    expect(paginateAdminPortalAppointments(items, 0).page).toBe(1);
    expect(paginateAdminPortalAppointments(items, 99).page).toBe(2);
  });

  it("handles empty list with one page", () => {
    const result = paginateAdminPortalAppointments([], 1);
    expect(result.totalItems).toBe(0);
    expect(result.totalPages).toBe(1);
    expect(result.items).toEqual([]);
  });
});
