import { describe, expect, it } from "vitest";
import { computeNotificationListMetrics } from "@/hooks/useNotificationListMetrics";
import type { Notification } from "@/types/notification";

function row(partial: Partial<Notification> & Pick<Notification, "id">): Notification {
  return {
    id: partial.id,
    user_id: "u1",
    title: partial.title ?? "T",
    message: partial.message ?? "M",
    type: partial.type ?? "status_update",
    read: partial.read ?? false,
    created_at: partial.created_at ?? new Date().toISOString(),
    link: partial.link,
  };
}

describe("computeNotificationListMetrics", () => {
  it("derives unread read billing and recent counts", () => {
    const now = new Date();
    const old = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
    const list = [
      row({ id: "1", read: false, type: "invoice_paid", created_at: now.toISOString() }),
      row({ id: "2", read: true, created_at: old }),
    ];
    const metrics = computeNotificationListMetrics(list, 1);
    expect(metrics.total).toBe(2);
    expect(metrics.unread).toBe(1);
    expect(metrics.read).toBe(1);
    expect(metrics.billing).toBe(1);
    expect(metrics.today).toBe(1);
  });
});
