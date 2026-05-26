"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  analyticsChartDescriptionClass,
  analyticsChartGlassClass,
  analyticsChartTitleClass,
} from "@/components/shared/analytics/analytics-chart-classes";
import { cn, toSentenceCaseSubtitle, toTitleCaseLabel } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  /** Extra detail on hover (chart purpose / data source). */
  detailHint?: string;
};

/** Glass chart panel — chrome stays mounted; inner chart area skeletons when loading. */
export function AnalyticsChartCard({
  title,
  subtitle,
  icon: Icon,
  loading = false,
  children,
  className,
  detailHint,
}: Props) {
  const hint = detailHint ?? subtitle;
  const displayTitle = toTitleCaseLabel(title);
  const displaySubtitle = subtitle ? toSentenceCaseSubtitle(subtitle) : undefined;

  return (
    <Card className={cn(analyticsChartGlassClass, className)}>
      <CardHeader className="pb-2">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <CardTitle className={cn("flex cursor-default items-center gap-2", analyticsChartTitleClass)}>
                {Icon ? (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-sky-200/80 bg-sky-50 text-sky-600">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                ) : null}
                <span className="min-w-0">{displayTitle}</span>
              </CardTitle>
            </TooltipTrigger>
            {hint ? (
              <TooltipContent side="top" className="max-w-xs text-xs">
                {hint}
              </TooltipContent>
            ) : null}
          </Tooltip>
        </TooltipProvider>
        {displaySubtitle ? (
          <CardDescription className={analyticsChartDescriptionClass}>
            {displaySubtitle}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-40 w-full rounded-xl" aria-hidden />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
