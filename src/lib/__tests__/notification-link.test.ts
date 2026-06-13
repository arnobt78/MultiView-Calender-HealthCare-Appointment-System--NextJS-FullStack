import { describe, expect, it } from "vitest";
import {
  NOTIFICATION_STALE_SUFFIX,
  appendNotificationStaleSuffix,
  notificationHrefsForEntity,
  parseNotificationLinkTarget,
} from "@/lib/notification-link";

const APPT_ID = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";
const INV_ID = "11111111-2222-4333-8444-555555555555";
const GONE_ID = "99999999-8888-4777-8666-555555555555";

describe("parseNotificationLinkTarget", () => {
  it("parses control-panel appointment links", () => {
    expect(
      parseNotificationLinkTarget(`/control-panel/appointments/${APPT_ID}`)
    ).toEqual({ kind: "appointment", id: APPT_ID });
  });

  it("parses portal appointment links", () => {
    expect(parseNotificationLinkTarget(`/appointments/${APPT_ID}`)).toEqual({
      kind: "appointment",
      id: APPT_ID,
    });
  });

  it("parses invoice links", () => {
    expect(parseNotificationLinkTarget(`/control-panel/invoices/${INV_ID}`)).toEqual({
      kind: "invoice",
      id: INV_ID,
    });
  });

  it("treats known section routes as static", () => {
    expect(parseNotificationLinkTarget("/doctor-portal")).toEqual({ kind: "static" });
    expect(parseNotificationLinkTarget("/control-panel/appointment-management")).toEqual({
      kind: "static",
    });
  });

  it("returns unknown for empty link", () => {
    expect(parseNotificationLinkTarget(null)).toEqual({ kind: "unknown" });
    expect(parseNotificationLinkTarget("")).toEqual({ kind: "unknown" });
  });
});

describe("appendNotificationStaleSuffix", () => {
  it("appends suffix once", () => {
    expect(appendNotificationStaleSuffix("Reminder sent")).toBe(
      `Reminder sent${NOTIFICATION_STALE_SUFFIX}`
    );
  });

  it("is idempotent", () => {
    const once = appendNotificationStaleSuffix("Done");
    expect(appendNotificationStaleSuffix(once)).toBe(once);
  });
});

describe("notificationHrefsForEntity", () => {
  it("includes admin and portal appointment hrefs", () => {
    const hrefs = notificationHrefsForEntity("appointment", APPT_ID);
    expect(hrefs).toContain(`/control-panel/appointments/${APPT_ID}`);
    expect(hrefs).toContain(`/appointments/${APPT_ID}`);
  });
});
