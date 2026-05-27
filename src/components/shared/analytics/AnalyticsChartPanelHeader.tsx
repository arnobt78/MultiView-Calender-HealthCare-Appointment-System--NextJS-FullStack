"use client";

import type { LucideIcon } from "lucide-react";
import {
  analyticsChartPanelIconTileClass,
  analyticsChartPanelTitleClass,
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
 * In-chart panel title row — tall icon tile + stacked title + period subtitle (doctor-portal parity).
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
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <h3 id={id} className={analyticsChartPanelTitleClass}>
          {toTitleCaseLabel(title)}
        </h3>
        {periodSubtitle ? (
          <p className={insightsChartPeriodSubtitleClass}>{periodSubtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
