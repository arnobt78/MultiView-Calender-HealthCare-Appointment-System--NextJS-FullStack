import { describe, expect, it } from "vitest";
import { parseNotificationStreamEvent } from "@/lib/notification-stream";

describe("parseNotificationStreamEvent", () => {
  it("parses connected event", () => {
    expect(
      parseNotificationStreamEvent(JSON.stringify({ type: "connected", userId: "u1" }))
    ).toEqual({ type: "connected", userId: "u1" });
  });

  it("parses notifications event with valid rows", () => {
    const row = {
      id: "n1",
      user_id: "u1",
      title: "Hi",
      message: "Body",
      type: "info",
      read: false,
      created_at: "2026-01-01T00:00:00.000Z",
      link: "/doctor-portal",
    };
    expect(
      parseNotificationStreamEvent(JSON.stringify({ type: "notifications", data: [row] }))
    ).toEqual({ type: "notifications", data: [row] });
  });

  it("filters invalid notification rows", () => {
    expect(
      parseNotificationStreamEvent(
        JSON.stringify({
          type: "notifications",
          data: [{ id: "bad" }, null],
        })
      )
    ).toEqual({ type: "notifications", data: [] });
  });

  it("returns null for heartbeat lines", () => {
    expect(parseNotificationStreamEvent(": heartbeat")).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    expect(parseNotificationStreamEvent("{not-json")).toBeNull();
  });

  it("returns null for unknown event type", () => {
    expect(parseNotificationStreamEvent(JSON.stringify({ type: "other" }))).toBeNull();
  });
});
