"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  DollarSign,
  FolderTree,
  Layers,
  PieChart,
  Receipt,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { AnalyticsChartEmptyStateCopy } from "@/components/shared/analytics/AnalyticsChartEmptyStateCopy";
import type { AnalyticsChartEmptyCopy, AnalyticsChartEmptyIconName } from "@/lib/analytics-chart-empty";
import { analyticsChartEmptyOverlayClass } from "@/lib/analytics-chart-interaction";
import { cn } from "@/lib/utils";

const ICON_BY_NAME: Record<AnalyticsChartEmptyIconName, LucideIcon> = {
  "bar-chart": BarChart3,
  calendar: CalendarDays,
  layers: Layers,
  folder: FolderTree,
  pie: PieChart,
  dollar: DollarSign,
  receipt: Receipt,
  user: UserRound,
  activity: Activity,
  stethoscope: Stethoscope,
};

type Props = {
  copy: AnalyticsChartEmptyCopy;
  className?: string;
};

/** Muted icon + inline empty copy centered over the chart plot (axes remain visible underneath). */
export function AnalyticsChartEmptyOverlay({ copy, className }: Props) {
  const Icon = ICON_BY_NAME[copy.iconName];
  return (
    <div className={cn(analyticsChartEmptyOverlayClass, className)} role="status" aria-live="polite">
      <Icon className="h-8 w-8 shrink-0 text-muted-foreground/60" aria-hidden />
      <AnalyticsChartEmptyStateCopy title={copy.title} description={copy.description} />
    </div>
  );
}
