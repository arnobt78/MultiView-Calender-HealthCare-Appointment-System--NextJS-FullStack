/**
 * Client SSE helpers for GET /api/notifications/stream.
 * Server polls every 10s — not a DB push. Any `notifications` event marks cache stale.
 */

import type { Notification } from "@/types/notification";

/** Same-origin stream URL — session cookie sent automatically by EventSource. */
export const NOTIFICATION_STREAM_URL = "/api/notifications/stream";

export type NotificationStreamConnectedEvent = {
  type: "connected";
  userId: string;
};

export type NotificationStreamNotificationsEvent = {
  type: "notifications";
  data: Notification[];
};

export type NotificationStreamEvent =
  | NotificationStreamConnectedEvent
  | NotificationStreamNotificationsEvent;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object";
}

function isNotificationRow(value: unknown): value is Notification {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.user_id === "string" &&
    typeof value.title === "string" &&
    typeof value.message === "string" &&
    typeof value.type === "string" &&
    typeof value.read === "boolean" &&
    typeof value.created_at === "string"
  );
}

/**
 * Parse SSE `data:` JSON lines — ignores heartbeats and malformed payloads.
 */
export function parseNotificationStreamEvent(raw: string): NotificationStreamEvent | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith(":")) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }

  if (!isRecord(parsed) || typeof parsed.type !== "string") return null;

  if (parsed.type === "connected" && typeof parsed.userId === "string") {
    return { type: "connected", userId: parsed.userId };
  }

  if (parsed.type === "notifications" && Array.isArray(parsed.data)) {
    const data = parsed.data.filter(isNotificationRow);
    return { type: "notifications", data };
  }

  return null;
}

/** Reconnect delay after stream error (auth expiry / network blip). */
export const NOTIFICATION_STREAM_RECONNECT_MS = 3_000;
