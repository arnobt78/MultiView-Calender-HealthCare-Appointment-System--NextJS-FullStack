"use client";

import { AlertCircle, CheckCircle2, CircleDashed, ListFilter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Stable display order for appointment status chips on /insights. */
export const INSIGHTS_STATUS_ORDER = ["done", "pending", "alert"] as const;

type StatusKey = (typeof INSIGHTS_STATUS_ORDER)[number];

const STATUS_META: Record<
  StatusKey,
  { label: string; icon: typeof CheckCircle2; shell: string; hint: string }
> = {
  done: {
    label: "Done",
    icon: CheckCircle2,
    shell:
      "border-emerald-400/30 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 text-emerald-800 shadow-[0_10px_28px_rgba(16,185,129,0.2)]",
    hint: "Completed appointments in scope",
  },
  pending: {
    label: "Pending",
    icon: CircleDashed,
    shell:
      "border-amber-400/30 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/5 text-amber-900 shadow-[0_10px_28px_rgba(245,158,11,0.18)]",
    hint: "Scheduled or in-progress visits",
  },
  alert: {
    label: "Alert",
    icon: AlertCircle,
    shell:
      "border-rose-400/30 bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-rose-500/5 text-rose-800 shadow-[0_10px_28px_rgba(225,29,72,0.18)]",
    hint: "Escalated or flagged appointments",
  },
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

/** Compact status breakdown — glass pills with Lucide icons. */
export function AnalyticsStatusSummaryRow({ byStatus, loading, className }: Props) {
  const counts = normalizeInsightsByStatus(byStatus);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-500/8 via-white/90 to-white/95 px-4 py-3 shadow-[0_14px_40px_rgba(2,132,199,0.12)] backdrop-blur-sm",
        className
      )}
    >
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sky-600">
        <ListFilter className="h-3.5 w-3.5" aria-hidden />
        By status
      </span>
      {INSIGHTS_STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status];
        const Icon = meta.icon;
        return (
          <div
            key={status}
            className="flex items-center gap-2"
            title={meta.hint}
          >
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium backdrop-blur-sm",
                meta.shell
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {meta.label}
            </span>
            {loading ? (
              <Skeleton className="h-6 w-8 rounded-md" aria-hidden />
            ) : (
              <span className="text-lg font-semibold tabular-nums text-gray-700">
                {counts[status]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
