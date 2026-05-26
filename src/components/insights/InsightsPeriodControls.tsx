"use client";

/**
 * Insights period segmented control — day / week / month / year; URL sync via parent.
 */

import { Button } from "@/components/ui/button";
import { INSIGHTS_PERIODS, type InsightsPeriod } from "@/lib/insights/insights-period";
import { cn } from "@/lib/utils";

const PERIOD_LABELS: Record<InsightsPeriod, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
  year: "Year",
};

type Props = {
  period: InsightsPeriod;
  onPeriodChange: (next: InsightsPeriod) => void;
  disabled?: boolean;
};

export function InsightsPeriodControls({ period, onPeriodChange, disabled = false }: Props) {
  return (
    <div
      className="flex shrink-0 flex-wrap items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50/80 p-0.5"
      role="group"
      aria-label="Insights period"
    >
      {INSIGHTS_PERIODS.map((p) => (
        <Button
          key={p}
          type="button"
          size="sm"
          variant={period === p ? "default" : "ghost"}
          className={cn("h-8 px-3 text-xs sm:text-sm", period !== p && "text-muted-foreground")}
          disabled={disabled}
          onClick={() => onPeriodChange(p)}
        >
          {PERIOD_LABELS[p]}
        </Button>
      ))}
    </div>
  );
}
