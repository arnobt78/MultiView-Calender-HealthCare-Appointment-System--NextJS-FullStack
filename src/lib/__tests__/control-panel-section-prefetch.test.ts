import { describe, expect, it, vi } from "vitest";
import { prefetchControlPanelSection } from "@/lib/control-panel-section-prefetch";

const mockBundle = {
  categories: [{ id: "c1" }],
  patients: [{ id: "p1" }],
  assignees: [{ id: "a1" }],
  dashboardAccessAccepted: [{ id: "d1" }],
  appointments: [{ id: "appt1" }],
};

vi.mock("@/lib/server-prefetch", () => ({
  prefetchDashboardOverview: vi.fn(async () => ({ ok: true })),
  prefetchPatients: vi.fn(async () => [{ id: "p1" }]),
  prefetchCategories: vi.fn(async () => [{ id: "c1" }]),
  prefetchOrganizations: vi.fn(async () => [{ id: "o1" }]),
  prefetchGlobalAppointmentTypes: vi.fn(async () => [{ id: "t1" }]),
  prefetchInvoices: vi.fn(async () => [{ id: "inv1" }]),
  prefetchBillingAppointmentOptions: vi.fn(async () => ({
    options: [{ id: "appt-bill", eligible: true }],
  })),
  prefetchNotifications: vi.fn(async () => ({
    notifications: [{ id: "n1" }],
    total: 1,
    unreadCount: 1,
  })),
  prefetchCalendarAppointmentsBundle: vi.fn(async () => mockBundle),
}));

describe("prefetchControlPanelSection", () => {
  it("prefetches only overview data for overview tab", async () => {
    const result = await prefetchControlPanelSection("overview", "user-1", "u@test.com", "admin");
    expect(result.dashboardOverview).toEqual({ ok: true });
    expect(result.patients).toBeUndefined();
  });

  it("prefetches invoices and billing picker for invoices tab", async () => {
    const result = await prefetchControlPanelSection("invoices", "user-1", "u@test.com", "admin");
    expect(result.invoices).toEqual([{ id: "inv1" }]);
    expect(result.billingAppointmentOptions).toEqual({
      options: [{ id: "appt-bill", eligible: true }],
    });
  });

  it("prefetches calendar bundle for appointments_mgmt tab", async () => {
    const result = await prefetchControlPanelSection(
      "appointments_mgmt",
      "user-1",
      "u@test.com",
      "admin"
    );
    expect(result).toEqual(mockBundle);
  });

  it("prefetches calendar bundle for telehealth tab", async () => {
    const result = await prefetchControlPanelSection("telehealth", "user-1", "u@test.com", "admin");
    expect(result.appointments).toEqual([{ id: "appt1" }]);
    expect(result.categories).toEqual([{ id: "c1" }]);
  });

  it("prefetches notifications for notifications tab", async () => {
    const result = await prefetchControlPanelSection(
      "notifications",
      "user-1",
      "u@test.com",
      "admin"
    );
    expect(result.notifications).toEqual({
      notifications: [{ id: "n1" }],
      total: 1,
      unreadCount: 1,
    });
  });

  it("returns empty payload for tabs without SSR prefetch", async () => {
    const result = await prefetchControlPanelSection(
      "google-calendar",
      "user-1",
      "u@test.com",
      "admin"
    );
    expect(result).toEqual({});
  });
});
