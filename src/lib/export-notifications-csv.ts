/**
 * CSV export for CP notifications list — uses toolbar-filtered rows.
 */

import type { Notification } from "@/types/notification";
import { getNotificationTypeConfig } from "@/lib/notification-type-display";

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportNotificationsCSV(notifications: Notification[]): void {
  const headers = ["ID", "Type", "Type Label", "Title", "Message", "Read", "Received", "Link"];
  const rows = notifications.map((n) => {
    const cfg = getNotificationTypeConfig(n.type);
    return [
      n.id,
      n.type,
      cfg.label,
      n.title,
      n.message,
      n.read ? "yes" : "no",
      n.created_at,
      n.link ?? "",
    ]
      .map((v) => escapeCsv(String(v)))
      .join(",");
  });
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `notifications-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
