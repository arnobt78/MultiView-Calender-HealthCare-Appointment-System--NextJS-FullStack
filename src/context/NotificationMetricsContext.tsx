"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Notification } from "@/types/notification";
import type { NotificationListMetrics } from "@/hooks/useNotificationListMetrics";

export type NotificationMetricsContextValue = {
  notifications: Notification[];
  metrics: NotificationListMetrics;
  isLoading: boolean;
  isFetching: boolean;
  listBodyLoading: boolean;
};

const NotificationMetricsContext = createContext<NotificationMetricsContextValue | null>(null);

export function NotificationMetricsProvider({
  value,
  children,
}: {
  value: NotificationMetricsContextValue;
  children: ReactNode;
}) {
  const memo = useMemo(
    () => ({
      notifications: value.notifications,
      metrics: value.metrics,
      isLoading: value.isLoading,
      isFetching: value.isFetching,
      listBodyLoading: value.listBodyLoading,
    }),
    [
      value.notifications,
      value.metrics,
      value.isLoading,
      value.isFetching,
      value.listBodyLoading,
    ]
  );
  return (
    <NotificationMetricsContext.Provider value={memo}>
      {children}
    </NotificationMetricsContext.Provider>
  );
}

export function useNotificationMetricsContext() {
  const ctx = useContext(NotificationMetricsContext);
  if (!ctx) {
    throw new Error("useNotificationMetricsContext requires NotificationMetricsProvider");
  }
  return ctx;
}
