"use client";

import { resolveAppointmentStatusMeta } from "@/lib/appointment-status-display";
import { ListFilter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  insightsChartPeriodSubtitleClass,
  insightsStatusSummaryRowClass,
} from "@/lib/insights-ui-classes";
import { cn } from "@/lib/utils";

/** Stable display order for appointment status chips on /insights. */
export const INSIGHTS_STATUS_ORDER = ["done", "pending", "alert", "cancelled"] as const;

type StatusKey = (typeof INSIGHTS_STATUS_ORDER)[number];

/** Collapse Prisma status keys into done / pending / alert / cancelled buckets. */
export function normalizeInsightsByStatus(
  byStatus: Record<string, number> | undefined
): Record<StatusKey, number> {
  const out: Record<StatusKey, number> = { done: 0, pending: 0, alert: 0, cancelled: 0 };
  if (!byStatus) return out;
  for (const [key, count] of Object.entries(byStatus)) {
    const normalized = resolveAppointmentStatusMeta(key).status as StatusKey;
    out[normalized] += count;
  }
  return out;
}

type Props = {
  byStatus: Record<string, number> | undefined;
  /** View-as period line (sky) — same as chart subtitles. */
  periodLabel?: string;
  loading: boolean;
  className?: string;
};

/** Compact status breakdown — glass pills with Lucide icons. */
export function AnalyticsStatusSummaryRow({
  byStatus,
  periodLabel,
  loading,
  className,
}: Props) {
  const counts = normalizeInsightsByStatus(byStatus);

  return (
    <div className={cn(insightsStatusSummaryRowClass, className)}>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sky-600">
          <ListFilter className="h-3.5 w-3.5" aria-hidden />
          By status
        </span>
        {periodLabel ? (
          <span className={insightsChartPeriodSubtitleClass}>{periodLabel}</span>
        ) : null}
      </span>
      {INSIGHTS_STATUS_ORDER.map((status) => {
        const meta = resolveAppointmentStatusMeta(status);
        const Icon = meta.Icon;
        const hint =
          status === "done"
            ? "Completed appointments in scope"
            : status === "alert"
              ? "Escalated or flagged appointments"
              : status === "cancelled"
                ? "Cancelled visits in scope"
                : "Scheduled or in-progress visits";
        return (
          <div
            key={status}
            className="flex items-center gap-2"
            title={hint}
          >
            <Badge
              variant="outline"
              className={cn(
                "calendar-glass-badge inline-flex min-h-6 items-center gap-1.5 rounded-full px-2 text-xs font-normal",
                meta.glassClass
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {meta.label}
            </Badge>
            {loading ? (
              <Skeleton className="h-6 w-8 rounded-md" aria-hidden />
            ) : (
              <span className="text-sm font-semibold tabular-nums text-gray-700">
                {counts[status]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
