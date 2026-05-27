"use client";

import {
  analyticsChartEmptyCopyStackClass,
  analyticsChartEmptyDescriptionClass,
  analyticsChartEmptyTitleClass,
} from "@/lib/analytics-chart-interaction";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  className?: string;
};

/** Empty-state copy — title row, then description row (each full width, responsive wrap). */
export function AnalyticsChartEmptyStateCopy({ title, description, className }: Props) {
  return (
    <div className={cn(analyticsChartEmptyCopyStackClass, className)}>
      <p className={cn(analyticsChartEmptyTitleClass, "w-full")}>{title}</p>
      <p className={cn(analyticsChartEmptyDescriptionClass, "w-full")}>{description}</p>
    </div>
  );
}
