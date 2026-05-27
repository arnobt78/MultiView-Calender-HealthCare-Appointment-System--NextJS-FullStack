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

/**
 * Glass chart panel — single `CardContent` shell (doctor-portal parity).
 * Header icon/title/subtitle stay inside the card; chart body follows in the same padding box.
 */
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
