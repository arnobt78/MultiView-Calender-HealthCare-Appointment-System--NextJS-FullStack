/**
 * CP section manual refresh — Sonner success/error toasts (bottom-right via `notify`).
 * Call from Refresh header actions after TanStack `refetch()` resolves.
 */

import { RefreshCw } from "lucide-react";
import type { QueryObserverResult } from "@tanstack/react-query";
import { formatDashboardOverviewLastUpdated } from "@/lib/dashboard-overview-subtitle";
import { notify } from "@/lib/notify";

export type CpRefreshNotifySection = "overview" | "notifications";

export type CpRefreshNotifyContext = {
  total?: number;
  unreadCount?: number;
};

/** Toast copy — includes HH:mm:ss from query `dataUpdatedAt` after refetch. */
export function buildCpRefreshSuccessNotify(
  section: CpRefreshNotifySection,
  updatedAtMs: number,
  context?: CpRefreshNotifyContext
): { title: string; subtitle: string; subtitle2?: string } {
  const time = formatDashboardOverviewLastUpdated(updatedAtMs);

  if (section === "overview") {
    return {
      title: "Dashboard refreshed",
      subtitle: "Real-time system summary is up to date.",
      subtitle2: `Last updated ${time}.`,
    };
  }

  const total = context?.total;
  const unread = context?.unreadCount ?? 0;
  const countLine =
    total != null
      ? unread > 0
        ? `${total} total · ${unread} unread`
        : `${total} total`
      : undefined;

  return {
    title: "Notifications refreshed",
    subtitle: "In-app inbox synced with the server.",
    subtitle2: countLine ? `Last updated ${time} · ${countLine}.` : `Last updated ${time}.`,
  };
}

/** Await refetch, then show success or error Sonner — deduped per section via toastId. */
export async function runCpSectionRefresh(
  refetch: () => Promise<QueryObserverResult<unknown>>,
  section: CpRefreshNotifySection,
  context?: CpRefreshNotifyContext
): Promise<void> {
  const toastId = `cp-refresh-${section}`;

  try {
    const result = await refetch();

    if (result.isError) {
      notify.error({
        title: section === "overview" ? "Dashboard refresh failed" : "Notifications refresh failed",
        subtitle: "Could not load the latest data. Please try again.",
        toastId,
      });
      return;
    }

    const updatedAt = result.dataUpdatedAt > 0 ? result.dataUpdatedAt : Date.now();
    const payload = buildCpRefreshSuccessNotify(section, updatedAt, context);

    notify.success({
      title: payload.title,
      subtitle: payload.subtitle,
      subtitle2: payload.subtitle2,
      icon: RefreshCw,
      toastId,
    });
  } catch {
    notify.error({
      title: section === "overview" ? "Dashboard refresh failed" : "Notifications refresh failed",
      subtitle: "Could not load the latest data. Please try again.",
      toastId,
    });
  }
}
