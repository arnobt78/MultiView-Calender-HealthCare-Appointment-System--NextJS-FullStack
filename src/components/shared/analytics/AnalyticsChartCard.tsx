"use client";

import type { LucideIcon } from "lucide-react";
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
  /** Dynamic period label from v2.meta.periodLabel (View-as filter). */
  periodSubtitle?: string;
  /** Required — every insights chart uses portal-style icon tile chrome. */
  icon: LucideIcon;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
  /** Static chart explanation — tooltip only, not shown as subtitle. */
  detailHint?: string;
};

/**
 * Glass chart panel — single `CardContent` shell (doctor-portal parity).
 * Header icon/title/period subtitle stay inside the card; chart body follows in the same padding box.
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
      <CardContent className="overflow-visible p-4 text-gray-700 sm:p-6">
        <section aria-labelledby={headingId}>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-default text-left">
                  <AnalyticsChartPanelHeader
                    id={headingId}
                    title={title}
                    periodSubtitle={periodSubtitle}
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
