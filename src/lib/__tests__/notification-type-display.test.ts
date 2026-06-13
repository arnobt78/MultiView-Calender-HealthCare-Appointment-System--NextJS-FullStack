import { describe, expect, it } from "vitest";
import {
  getNotificationListSearchBlob,
  getNotificationTypeConfig,
  isBillingNotificationDisplayType,
  isInternalNotificationLink,
} from "@/lib/notification-type-display";

describe("notification-type-display", () => {
  it("returns known config for status_update", () => {
    const cfg = getNotificationTypeConfig("status_update");
    expect(cfg.label).toBe("Status");
    expect(cfg.dotClass).toContain("amber");
  });

  it("falls back for unknown types", () => {
    const cfg = getNotificationTypeConfig("custom_event");
    expect(cfg.label).toBe("custom event");
  });

  it("detects billing types", () => {
    expect(isBillingNotificationDisplayType("invoice_paid")).toBe(true);
    expect(isBillingNotificationDisplayType("status_update")).toBe(false);
  });

  it("builds search blob from title message and type label", () => {
    const blob = getNotificationListSearchBlob({
      title: "Hello",
      message: "World",
      type: "status_update",
    });
    expect(blob).toContain("hello");
    expect(blob).toContain("status");
  });

  it("classifies internal links", () => {
    expect(isInternalNotificationLink("/control-panel/notifications")).toBe(true);
    expect(isInternalNotificationLink("https://example.com")).toBe(false);
    expect(isInternalNotificationLink(undefined)).toBe(false);
  });
});
