"use client";

import type { LucideIcon } from "lucide-react";
import {
  analyticsChartPanelIconTileClass,
  analyticsChartPanelTitleClass,
  analyticsChartPanelTitleRowClass,
  insightsChartPeriodSubtitleClass,
} from "@/lib/insights-ui-classes";
import { cn, toTitleCaseLabel } from "@/lib/utils";

type AnalyticsChartPanelHeaderProps = {
  title: string;
  /** Dynamic View-as period line only (sky accent) — no static prefix text. */
  periodSubtitle?: string;
  icon: LucideIcon;
  iconClassName?: string;
  id?: string;
  className?: string;
};

/**
 * In-chart panel title row — tall icon tile + title + optional period subtitle (doctor-portal parity).
 */
export function AnalyticsChartPanelHeader({
  title,
  periodSubtitle,
  icon: Icon,
  iconClassName,
  id,
  className,
}: AnalyticsChartPanelHeaderProps) {
  return (
    <div className={cn("mb-3 flex gap-3", className)}>
      <span className={cn(analyticsChartPanelIconTileClass, iconClassName)} aria-hidden>
        <Icon className="h-4 w-4" />
      </span>
      <div className={analyticsChartPanelTitleRowClass}>
        <h3 id={id} className={cn(analyticsChartPanelTitleClass, "shrink-0")}>
          {toTitleCaseLabel(title)}
        </h3>
        {periodSubtitle ? (
          <span className={cn(insightsChartPeriodSubtitleClass, "min-w-0")}>{periodSubtitle}</span>
        ) : null}
      </div>
    </div>
  );
}
