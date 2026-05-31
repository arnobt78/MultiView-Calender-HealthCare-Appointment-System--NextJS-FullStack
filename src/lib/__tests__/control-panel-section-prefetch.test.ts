import { describe, expect, it, vi } from "vitest";
import { prefetchControlPanelSection } from "@/lib/control-panel-section-prefetch";

vi.mock("@/lib/server-prefetch", () => ({
  prefetchDashboardOverview: vi.fn(async () => ({ ok: true })),
  prefetchPatients: vi.fn(async () => [{ id: "p1" }]),
  prefetchCategories: vi.fn(async () => [{ id: "c1" }]),
  prefetchOrganizations: vi.fn(async () => [{ id: "o1" }]),
  prefetchGlobalAppointmentTypes: vi.fn(async () => [{ id: "t1" }]),
}));

describe("prefetchControlPanelSection", () => {
  it("prefetches only overview data for overview tab", async () => {
    const result = await prefetchControlPanelSection("overview", "user-1");
    expect(result.dashboardOverview).toEqual({ ok: true });
    expect(result.patients).toBeUndefined();
  });

  it("returns empty payload for tabs without SSR prefetch", async () => {
    const result = await prefetchControlPanelSection("telehealth", "user-1");
    expect(result).toEqual({});
  });
});
