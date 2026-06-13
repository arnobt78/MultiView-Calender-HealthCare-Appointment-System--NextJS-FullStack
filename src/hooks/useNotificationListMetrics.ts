import { useMemo } from "react";
import type { Notification } from "@/types/notification";
import { isBillingNotificationDisplayType } from "@/lib/notification-type-display";
import { isToday } from "date-fns";

/** Derived counts for CP notification stat cards — pure function of cached list. */
export type NotificationListMetrics = {
  total: number;
  unread: number;
  read: number;
  billing: number;
  today: number;
};

export function computeNotificationListMetrics(
  notifications: Notification[],
  unreadCountFromApi: number
): NotificationListMetrics {
  let read = 0;
  let billing = 0;
  let today = 0;

  for (const n of notifications) {
    if (n.read) read++;
    if (isBillingNotificationDisplayType(n.type)) billing++;
    const created = new Date(n.created_at);
    if (!Number.isNaN(created.getTime()) && isToday(created)) {
      today++;
    }
  }

  const unread =
    unreadCountFromApi > 0
      ? unreadCountFromApi
      : notifications.filter((n) => !n.read).length;

  return {
    total: notifications.length,
    unread,
    read,
    billing,
    today,
  };
}

export function useNotificationListMetrics(
  notifications: Notification[],
  unreadCountFromApi: number
): NotificationListMetrics {
  return useMemo(
    () => computeNotificationListMetrics(notifications, unreadCountFromApi),
    [notifications, unreadCountFromApi]
  );
}
