/**
 * Shared notification row shape for REST + SSE responses.
 */

import type { Notification } from "@/types/notification";

export function serializeNotificationRow(row: {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: Date;
  link: string | null;
  link_valid?: boolean;
}): Notification {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    created_at: row.created_at?.toISOString?.() ?? "",
    link: row.link ?? undefined,
    link_valid: row.link_valid,
  };
}
