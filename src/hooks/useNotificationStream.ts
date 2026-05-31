"use client";

/**
 * Single global SSE connection — mount only in QueryProvider (not inside useNotifications).
 */

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { subscribeNotificationStream } from "@/lib/notification-stream-subscribe";

/** Connect when authed; disconnect on logout/unmount. */
export function useNotificationStream(enabled: boolean): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    return subscribeNotificationStream(queryClient);
  }, [enabled, queryClient]);
}
