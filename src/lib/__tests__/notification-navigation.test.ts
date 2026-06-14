import { describe, expect, it } from "vitest";
import {
  canNavigateNotification,
  notificationRowActionCount,
} from "@/lib/notification-navigation";

describe("canNavigateNotification", () => {
  it("returns true when link_valid and link present", () => {
    expect(
      canNavigateNotification({ link: "/appointments/x", link_valid: true })
    ).toBe(true);
  });

  it("returns false when stale or missing link", () => {
    expect(
      canNavigateNotification({ link: "/appointments/x", link_valid: false })
    ).toBe(false);
    expect(canNavigateNotification({ link: undefined, link_valid: false })).toBe(false);
  });
});

describe("notificationRowActionCount", () => {
  it("counts mark read and open link", () => {
    expect(
      notificationRowActionCount({
        link: "/appointments/x",
        link_valid: true,
        read: false,
      })
    ).toBe(2);
  });

  it("returns 0 for read stale row", () => {
    expect(
      notificationRowActionCount({
        link: "/appointments/x",
        link_valid: false,
        read: true,
      })
    ).toBe(0);
  });

  it("returns 1 for unread without navigable link", () => {
    expect(
      notificationRowActionCount({
        link: undefined,
        link_valid: false,
        read: false,
      })
    ).toBe(1);
  });
});
