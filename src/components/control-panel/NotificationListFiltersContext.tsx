"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Notification } from "@/types/notification";
import { KNOWN_NOTIFICATION_TYPES } from "@/lib/notification-type-display";
import type {
  NotificationLinkFilter,
  NotificationReadStatusFilter,
  NotificationRecencyFilter,
  NotificationTypeFilter,
} from "@/lib/notification-filter-presets";
import { matchesNotificationLinkFilter } from "@/lib/notification-list-filter";
import { isToday, subDays } from "date-fns";

type Ctx = {
  readStatus: NotificationReadStatusFilter;
  setReadStatus: (v: NotificationReadStatusFilter) => void;
  typeFilter: NotificationTypeFilter;
  setTypeFilter: (v: NotificationTypeFilter) => void;
  linkFilter: NotificationLinkFilter;
  setLinkFilter: (v: NotificationLinkFilter) => void;
  recency: NotificationRecencyFilter;
  setRecency: (v: NotificationRecencyFilter) => void;
  applyToolbarFilters: (list: Notification[]) => Notification[];
};

const NotificationListFiltersContext = createContext<Ctx | null>(null);

const knownTypeSet = new Set<string>(KNOWN_NOTIFICATION_TYPES);

function matchesRecency(createdAt: string, recency: NotificationRecencyFilter): boolean {
  if (recency === "all") return true;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return false;
  const now = new Date();
  if (recency === "today") return isToday(created);
  if (recency === "7d") return created >= subDays(now, 7);
  if (recency === "30d") return created >= subDays(now, 30);
  return true;
}

export function NotificationListFiltersProvider({ children }: { children: ReactNode }) {
  const [readStatus, setReadStatus] = useState<NotificationReadStatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>("all");
  const [linkFilter, setLinkFilter] = useState<NotificationLinkFilter>("all");
  const [recency, setRecency] = useState<NotificationRecencyFilter>("all");

  const applyToolbarFilters = useCallback(
    (list: Notification[]) => {
      let out = list;
      if (readStatus === "unread") {
        out = out.filter((n) => !n.read);
      } else if (readStatus === "read") {
        out = out.filter((n) => n.read);
      }
      if (typeFilter !== "all") {
        if (typeFilter === "other") {
          out = out.filter((n) => !knownTypeSet.has(n.type));
        } else {
          out = out.filter((n) => n.type === typeFilter);
        }
      }
      if (linkFilter !== "all") {
        out = out.filter((n) => matchesNotificationLinkFilter(n, linkFilter));
      }
      if (recency !== "all") {
        out = out.filter((n) => matchesRecency(n.created_at, recency));
      }
      return out;
    },
    [readStatus, typeFilter, linkFilter, recency]
  );

  const value = useMemo(
    () => ({
      readStatus,
      setReadStatus,
      typeFilter,
      setTypeFilter,
      linkFilter,
      setLinkFilter,
      recency,
      setRecency,
      applyToolbarFilters,
    }),
    [readStatus, typeFilter, linkFilter, recency, applyToolbarFilters]
  );

  return (
    <NotificationListFiltersContext.Provider value={value}>
      {children}
    </NotificationListFiltersContext.Provider>
  );
}

export function useNotificationListFilters() {
  const ctx = useContext(NotificationListFiltersContext);
  if (!ctx) {
    throw new Error("useNotificationListFilters requires NotificationListFiltersProvider");
  }
  return ctx;
}
