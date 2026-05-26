"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Stable display order for appointment status chips on /insights. */
export const INSIGHTS_STATUS_ORDER = ["done", "pending", "alert"] as const;

type StatusKey = (typeof INSIGHTS_STATUS_ORDER)[number];

const STATUS_VARIANT: Record<
  StatusKey,
  "default" | "secondary" | "outline" | "destructive"
> = {
  done: "default",
  pending: "secondary",
  alert: "outline",
};

const STATUS_LABEL: Record<StatusKey, string> = {
  done: "Done",
  pending: "Pending",
  alert: "Alert",
};

/** Collapse Prisma status keys into done / pending / alert buckets for the summary row. */
export function normalizeInsightsByStatus(
  byStatus: Record<string, number> | undefined
): Record<StatusKey, number> {
  const out: Record<StatusKey, number> = { done: 0, pending: 0, alert: 0 };
  if (!byStatus) return out;
  for (const [key, count] of Object.entries(byStatus)) {
    const normalized =
      key === "done" ? "done" : key === "alert" ? "alert" : "pending";
    out[normalized] += count;
  }
  return out;
}

type Props = {
  byStatus: Record<string, number> | undefined;
  loading: boolean;
  className?: string;
};

/** Compact status breakdown — complements stacked status-over-time chart. */
export function AnalyticsStatusSummaryRow({ byStatus, loading, className }: Props) {
  const counts = normalizeInsightsByStatus(byStatus);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/60 px-4 py-3",
        className
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">By status</span>
      {INSIGHTS_STATUS_ORDER.map((status) => (
        <div key={status} className="flex items-center gap-2">
          <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
          {loading ? (
            <Skeleton className="h-6 w-8 rounded-md" aria-hidden />
          ) : (
            <span className="text-lg font-semibold tabular-nums text-gray-700">
              {counts[status]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
