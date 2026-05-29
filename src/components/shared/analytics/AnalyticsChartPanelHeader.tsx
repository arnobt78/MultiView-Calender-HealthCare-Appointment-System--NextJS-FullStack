"use client";

import type { LucideIcon } from "lucide-react";
import { PortalPanelCountBadge } from "@/components/shared/PortalPanelCountBadge";
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
  /** Inline count pill beside title (doctor-portal section parity). */
  count?: number;
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
  count,
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
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h3
          id={id}
          className={cn(
            analyticsChartPanelTitleClass,
            "flex flex-wrap items-center gap-x-2 gap-y-0.5"
          )}
        >
          <span className="min-w-0">{toTitleCaseLabel(title)}</span>
          {count !== undefined ? (
            <PortalPanelCountBadge>{count}</PortalPanelCountBadge>
          ) : null}
        </h3>
        {periodSubtitle ? (
          <p className={insightsChartPeriodSubtitleClass}>{periodSubtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
