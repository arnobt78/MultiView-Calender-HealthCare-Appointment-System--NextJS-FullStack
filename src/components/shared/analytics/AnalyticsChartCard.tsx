"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnalyticsChartPanelHeader } from "@/components/shared/analytics/AnalyticsChartPanelHeader";
import { analyticsChartGlassClass } from "@/components/shared/analytics/analytics-chart-classes";
import { cn, toSentenceCaseSubtitle } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  /** Required — every insights chart uses portal-style icon tile chrome. */
  icon: LucideIcon;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
  /** Extra detail on hover (chart purpose / data source). */
  detailHint?: string;
};

/** Glass chart panel — chrome stays mounted; inner chart area skeletons when loading. */
export function AnalyticsChartCard({
  title,
  subtitle,
  icon,
  loading = false,
  children,
  className,
  iconClassName,
  detailHint,
}: Props) {
  const hint = detailHint ?? subtitle;
  const displayHint = hint ? toSentenceCaseSubtitle(hint) : undefined;

  return (
    <Card className={cn(analyticsChartGlassClass, className)}>
      <CardHeader className="pb-2">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-default text-left">
                <AnalyticsChartPanelHeader
                  title={title}
                  subtitle={subtitle}
                  icon={icon}
                  iconClassName={iconClassName}
                />
              </div>
            </TooltipTrigger>
            {displayHint ? (
              <TooltipContent side="top" className="max-w-xs text-xs">
                {displayHint}
              </TooltipContent>
            ) : null}
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      {/* overflow-visible — Recharts tooltips/labels render outside plot box */}
      <CardContent className="overflow-visible">
        {loading ? (
          <Skeleton className="h-40 w-full rounded-xl" aria-hidden />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
