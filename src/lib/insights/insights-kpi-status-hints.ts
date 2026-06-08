/**
 * Insights KPI value-row hints — same Open/Alert/Done/Cancelled copy as doctor portal.
 */

import { resolveAppointmentStatusMeta } from "@/lib/appointment-status-display";
import type { DailyAppointmentStats } from "@/lib/appointment-stats";
import {
  doctorPortalAllTimeStatusHintLabel,
  doctorPortalTodayStatusBadgeLabel,
} from "@/lib/doctor-portal-stat-badges";

type StatusBucket = "pending" | "alert" | "done" | "cancelled";

function normalizeInsightsStatusBuckets(
  byStatus: Record<string, number> | undefined
): Record<StatusBucket, number> {
  const out: Record<StatusBucket, number> = {
    pending: 0,
    alert: 0,
    done: 0,
    cancelled: 0,
  };
  if (!byStatus) return out;
  for (const [key, count] of Object.entries(byStatus)) {
    const normalized = resolveAppointmentStatusMeta(key).status as StatusBucket;
    out[normalized] += count;
  }
  return out;
}

/** Map Prisma groupBy status → dashboard day stats (pending → open). */
export function insightsByStatusToDayStats(
  byStatus: Record<string, number> | undefined
): Pick<DailyAppointmentStats, "open" | "alert" | "done" | "cancelled"> {
  const n = normalizeInsightsStatusBuckets(byStatus);
  return { open: n.pending, alert: n.alert, done: n.done, cancelled: n.cancelled };
}

/** Today tile value row — visits scheduled today in scope. */
export function insightsTodayKpiValueRowHint(
  todayByStatus: Record<string, number> | undefined
): string {
  return doctorPortalTodayStatusBadgeLabel(insightsByStatusToDayStats(todayByStatus));
}

/** Pending tile value row — all-time alert / done / cancelled in scope. */
export function insightsPendingAllTimeKpiValueRowHint(
  allTimeByStatus: Record<string, number> | undefined
): string {
  const s = insightsByStatusToDayStats(allTimeByStatus);
  return doctorPortalAllTimeStatusHintLabel({
    alert: s.alert,
    done: s.done,
    cancelled: s.cancelled,
  });
}
