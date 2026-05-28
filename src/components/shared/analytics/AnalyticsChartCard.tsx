"use client";

import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  periodSubtitle?: string;
  icon: LucideIcon;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
  /** Static chart explanation — info icon in header only (not over plot). */
  detailHint?: string;
};

/**
 * Glass chart panel — plot hover uses Recharts `AnalyticsChartTooltip`, not this header hint.
 */
export function AnalyticsChartCard({
  title,
  periodSubtitle,
  icon,
  loading = false,
  children,
  className,
  iconClassName,
  detailHint,
}: Props) {
  const displayHint = detailHint ? toSentenceCaseSubtitle(detailHint) : undefined;
  const headingId = `analytics-chart-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Card className={cn(analyticsChartGlassClass, "gap-0", className)}>

      <CardContent className="overflow-visible p-4 text-gray-700">
        <section aria-labelledby={headingId}>
          <div className="mb-3 flex items-start gap-2">
            <AnalyticsChartPanelHeader
              id={headingId}
              title={title}
              periodSubtitle={periodSubtitle}
              icon={icon}
              iconClassName={iconClassName}
              className="mb-0 min-w-0 flex-1"
            />
            {displayHint ? (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-500 shadow-sm hover:border-sky-200 hover:text-sky-700"
                      aria-label={`About ${title} chart`}
                    >
                      <Info className="h-4 w-4" aria-hidden />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs text-xs">
                    {displayHint}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
          </div>
          {loading ? (
            <Skeleton className="h-40 w-full rounded-xl" aria-hidden />
          ) : (
            children
          )}
        </section>
      </CardContent>
    </Card>
  );
}
