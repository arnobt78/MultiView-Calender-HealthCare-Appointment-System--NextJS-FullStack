import { describe, expect, it } from "vitest";
import { matchesNotificationLinkFilter } from "@/lib/notification-list-filter";

describe("matchesNotificationLinkFilter", () => {
  it("passes all rows when filter is all", () => {
    expect(
      matchesNotificationLinkFilter({ link: "/appointments/x", link_valid: false }, "all")
    ).toBe(true);
  });

  it("has_link requires link_valid true", () => {
    expect(
      matchesNotificationLinkFilter({ link: "/appointments/x", link_valid: true }, "has_link")
    ).toBe(true);
    expect(
      matchesNotificationLinkFilter({ link: "/appointments/x", link_valid: false }, "has_link")
    ).toBe(false);
    expect(matchesNotificationLinkFilter({ link: undefined, link_valid: false }, "has_link")).toBe(
      false
    );
  });

  it("no_link matches stale link string, null link, and undefined link_valid", () => {
    expect(
      matchesNotificationLinkFilter({ link: "/appointments/x", link_valid: false }, "no_link")
    ).toBe(true);
    expect(matchesNotificationLinkFilter({ link: undefined, link_valid: false }, "no_link")).toBe(
      true
    );
    expect(
      matchesNotificationLinkFilter({ link: "/doctor-portal", link_valid: undefined }, "no_link")
    ).toBe(true);
    expect(
      matchesNotificationLinkFilter({ link: "/appointments/x", link_valid: true }, "no_link")
    ).toBe(false);
  });
});
