import { describe, expect, it } from "vitest";
import { buildCpRefreshSuccessNotify } from "@/lib/control-panel-refresh-notify";

describe("buildCpRefreshSuccessNotify", () => {
  const ms = new Date(2026, 5, 10, 14, 15, 9).getTime();

  it("overview includes last updated time", () => {
    const msg = buildCpRefreshSuccessNotify("overview", ms);
    expect(msg.title).toBe("Dashboard refreshed");
    expect(msg.subtitle2).toBe("Last updated 14:15:09.");
  });

  it("notifications includes time and counts when provided", () => {
    const msg = buildCpRefreshSuccessNotify("notifications", ms, {
      total: 12,
      unreadCount: 3,
    });
    expect(msg.title).toBe("Notifications refreshed");
    expect(msg.subtitle2).toContain("14:15:09");
    expect(msg.subtitle2).toContain("12 total");
    expect(msg.subtitle2).toContain("3 unread");
  });

  it("notifications omits unread segment when zero", () => {
    const msg = buildCpRefreshSuccessNotify("notifications", ms, {
      total: 5,
      unreadCount: 0,
    });
    expect(msg.subtitle2).toBe("Last updated 14:15:09 · 5 total.");
  });
});
