/**
 * Opens one EventSource per tab — used by useNotificationStream in QueryProvider only.
 */

import type { QueryClient } from "@tanstack/react-query";
import { invalidateNotificationsAndCrossTab } from "@/lib/query-client";
import {
  NOTIFICATION_STREAM_RECONNECT_MS,
  NOTIFICATION_STREAM_URL,
  parseNotificationStreamEvent,
} from "@/lib/notification-stream";

/**
 * Subscribe to notification SSE and invalidate TanStack cache on new rows.
 * Returns cleanup — close stream + cancel pending reconnect.
 */
export function subscribeNotificationStream(queryClient: QueryClient): () => void {
  if (typeof EventSource === "undefined") return () => {};

  let source: EventSource | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  const clearReconnect = () => {
    if (reconnectTimer != null) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const connect = () => {
    if (closed) return;
    clearReconnect();
    source?.close();

    source = new EventSource(NOTIFICATION_STREAM_URL);

    source.onmessage = (event) => {
      const parsed = parseNotificationStreamEvent(event.data);
      if (parsed?.type === "notifications" && parsed.data.length > 0) {
        void invalidateNotificationsAndCrossTab(queryClient);
      }
    };

    source.onerror = () => {
      source?.close();
      source = null;
      if (closed) return;
      reconnectTimer = setTimeout(connect, NOTIFICATION_STREAM_RECONNECT_MS);
    };
  };

  connect();

  return () => {
    closed = true;
    clearReconnect();
    source?.close();
    source = null;
  };
}
