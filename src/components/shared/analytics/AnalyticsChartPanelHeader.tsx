"use client";

import type { LucideIcon } from "lucide-react";
import {
  analyticsChartPanelIconTileClass,
  analyticsChartPanelSubtitleClass,
  analyticsChartPanelTitleClass,
} from "@/lib/insights-ui-classes";
import { cn, toSentenceCaseSubtitle, toTitleCaseLabel } from "@/lib/utils";

type AnalyticsChartPanelHeaderProps = {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconClassName?: string;
  id?: string;
  className?: string;
};

/**
 * In-chart panel title row — tall icon tile + title/subtitle stack (doctor-portal subsection parity).
 */
export function AnalyticsChartPanelHeader({
  title,
  subtitle,
  icon: Icon,
  iconClassName,
  id,
  className,
}: AnalyticsChartPanelHeaderProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      <span className={cn(analyticsChartPanelIconTileClass, iconClassName)} aria-hidden>
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <h3 id={id} className={analyticsChartPanelTitleClass}>
          {toTitleCaseLabel(title)}
        </h3>
        {subtitle ? (
          <p className={analyticsChartPanelSubtitleClass}>{toSentenceCaseSubtitle(subtitle)}</p>
        ) : null}
      </div>
    </div>
  );
}
