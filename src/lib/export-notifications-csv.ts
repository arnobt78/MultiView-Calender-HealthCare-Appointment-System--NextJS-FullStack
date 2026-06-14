/**
 * CSV export for CP notifications list — uses toolbar-filtered rows from client cache.
 * Raw Link preserved for audit/forensics; Link Valid mirrors C34 `link_valid` UI gating.
 */

import type { Notification } from "@/types/notification";
import { getNotificationTypeConfig } from "@/lib/notification-type-display";

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Audit column — explicit `link_valid` flag, not navigability heuristic. */
function formatNotificationLinkValidCsv(n: Pick<Notification, "link_valid">): string {
  return n.link_valid === true ? "yes" : "no";
}

const NOTIFICATION_CSV_HEADERS = [
  "ID",
  "Type",
  "Type Label",
  "Title",
  "Message",
  "Read",
  "Received",
  "Link",
  "Link Valid",
] as const;

/** Pure CSV builder — testable without DOM download side effects. */
export function buildNotificationsCsvContent(notifications: Notification[]): string {
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
      formatNotificationLinkValidCsv(n),
    ]
      .map((v) => escapeCsv(String(v)))
      .join(",");
  });
  return [NOTIFICATION_CSV_HEADERS.join(","), ...rows].join("\n");
}

export function exportNotificationsCSV(notifications: Notification[]): void {
  const csv = buildNotificationsCsvContent(notifications);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `notifications-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
