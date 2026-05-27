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
import type { AnalyticsChartEmptyCopy, AnalyticsChartEmptyIconName } from "@/lib/analytics-chart-empty";
import {
  analyticsChartEmptyDescriptionClass,
  analyticsChartEmptyOverlayClass,
  analyticsChartEmptyTitleClass,
} from "@/lib/analytics-chart-interaction";
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

/** Muted icon + copy centered over the chart plot (axes remain visible underneath). */
export function AnalyticsChartEmptyOverlay({ copy, className }: Props) {
  const Icon = ICON_BY_NAME[copy.iconName];
  return (
    <div className={cn(analyticsChartEmptyOverlayClass, className)} role="status" aria-live="polite">
      <Icon className="h-8 w-8 text-muted-foreground/60" aria-hidden />
      <p className={analyticsChartEmptyTitleClass}>{copy.title}</p>
      <p className={analyticsChartEmptyDescriptionClass}>{copy.description}</p>
    </div>
  );
}
