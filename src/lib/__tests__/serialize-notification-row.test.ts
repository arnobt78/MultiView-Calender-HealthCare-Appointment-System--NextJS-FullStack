import { describe, expect, it } from "vitest";
import { serializeNotificationRow } from "@/lib/serialize-notification-row";

describe("serializeNotificationRow", () => {
  it("maps prisma row to Notification API shape", () => {
    expect(
      serializeNotificationRow({
        id: "n1",
        user_id: "u1",
        title: "Title",
        message: "Message",
        type: "info",
        read: false,
        created_at: new Date("2026-01-01T12:00:00.000Z"),
        link: "/doctor-portal",
      })
    ).toEqual({
      id: "n1",
      user_id: "u1",
      title: "Title",
      message: "Message",
      type: "info",
      read: false,
      created_at: "2026-01-01T12:00:00.000Z",
      link: "/doctor-portal",
    });
  });

  it("omits link when null", () => {
    const row = serializeNotificationRow({
      id: "n2",
      user_id: "u1",
      title: "T",
      message: "M",
      type: "info",
      read: true,
      created_at: new Date("2026-01-01T00:00:00.000Z"),
      link: null,
      link_valid: false,
    });
    expect(row.link).toBeUndefined();
    expect(row.link_valid).toBe(false);
  });

  it("includes link_valid when provided", () => {
    expect(
      serializeNotificationRow({
        id: "n3",
        user_id: "u1",
        title: "T",
        message: "M",
        type: "info",
        read: false,
        created_at: new Date("2026-01-01T00:00:00.000Z"),
        link: "/appointments/a",
        link_valid: false,
      }).link_valid
    ).toBe(false);
  });
});
