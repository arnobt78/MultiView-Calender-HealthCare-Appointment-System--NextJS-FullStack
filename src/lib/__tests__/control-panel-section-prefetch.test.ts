import { describe, expect, it, vi } from "vitest";
import { prefetchControlPanelSection } from "@/lib/control-panel-section-prefetch";

const mockBundle = {
  categories: [{ id: "c1" }],
  patients: [{ id: "p1" }],
  assignees: [{ id: "a1" }],
  dashboardAccessAccepted: [{ id: "d1" }],
  appointments: [{ id: "appt1" }],
};

vi.mock("@/lib/org-billing-prefetch", () => ({
  prefetchOrgBillingInvoicesByOrgIds: vi.fn(async (orgIds: string[]) => {
    const map: Record<
      string,
      {
        invoices: { id: string }[];
        billingKpi: {
          totals: {
            paid: { cents: number; count: number };
            outstanding: { cents: number; count: number };
            refunded: { cents: number; count: number };
            cancelled: { cents: number; count: number };
          };
        };
      }
    > = {};
    for (const id of orgIds) {
      map[id] = {
        invoices: [{ id: `inv-${id}` }],
        billingKpi: {
          totals: {
            paid: { cents: 100, count: 1 },
            outstanding: { cents: 0, count: 0 },
            refunded: { cents: 0, count: 0 },
            cancelled: { cents: 0, count: 0 },
          },
        },
      };
    }
    return map;
  }),
}));

vi.mock("@/lib/server-prefetch", () => ({
  prefetchDashboardOverview: vi.fn(async () => ({ ok: true })),
  prefetchPatients: vi.fn(async () => [{ id: "p1" }]),
  prefetchCategories: vi.fn(async () => [{ id: "c1" }]),
  prefetchOrganizations: vi.fn(async () => [
    { id: "o1" },
    { id: "o2" },
  ]),
  prefetchAdminAllAppointmentTypes: vi.fn(async () => ({
    globalTypes: [{ id: "t1" }],
    customTypes: [],
  })),
  prefetchInvitationsForUser: vi.fn(async () => ({
    appointmentInvitations: [{ id: "i1" }],
    dashboardInvitations: [{ id: "d1" }],
  })),
  prefetchGoogleCalendarStatus: vi.fn(async () => ({ connected: false, events: [], eventsFetchWarning: null })),
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

  it("prefetches calendar bundle and invoices for appointments_mgmt tab", async () => {
    const { prefetchInvoices } = await import("@/lib/server-prefetch");
    const result = await prefetchControlPanelSection(
      "appointments_mgmt",
      "user-1",
      "u@test.com",
      "admin"
    );
    expect(prefetchInvoices).toHaveBeenCalledWith("user-1", "admin", "u@test.com");
    expect(result).toEqual({ ...mockBundle, invoices: [{ id: "inv1" }] });
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
    expect(typeof result.notificationsPrefetchUpdatedAt).toBe("number");
    expect(result.notificationsPrefetchUpdatedAt).toBeGreaterThan(0);
  });

  it("prefetches org billing for every organization", async () => {
    const { prefetchOrgBillingInvoicesByOrgIds } = await import(
      "@/lib/org-billing-prefetch"
    );
    const result = await prefetchControlPanelSection(
      "organizations",
      "user-1",
      "u@test.com",
      "admin"
    );
    expect(prefetchOrgBillingInvoicesByOrgIds).toHaveBeenCalledWith(
      ["o1", "o2"],
      "user-1",
      "admin",
      "u@test.com"
    );
    expect(result.orgBillingInvoicesByOrgId?.o1?.invoices).toEqual([
      { id: "inv-o1" },
    ]);
    expect(result.orgBillingInvoicesByOrgId?.o2?.invoices).toEqual([
      { id: "inv-o2" },
    ]);
    expect(result.orgBillingInvoicesByOrgId?.o2?.billingKpi.totals.paid.cents).toBe(100);
  });

  it("prefetches google calendar status for google-calendar tab", async () => {
    const result = await prefetchControlPanelSection(
      "google-calendar",
      "user-1",
      "u@test.com",
      "admin"
    );
    expect(result.googleCalendarStatus).toEqual({
      connected: false,
      events: [],
      eventsFetchWarning: null,
    });
  });

  it("prefetches appointment invitations for appointment tab", async () => {
    const result = await prefetchControlPanelSection(
      "appointment",
      "user-1",
      "u@test.com",
      "admin"
    );
    expect(result.appointmentInvitations).toEqual([{ id: "i1" }]);
  });
});
