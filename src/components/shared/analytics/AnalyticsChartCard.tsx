"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { analyticsChartGlassClass } from "@/components/shared/analytics/analytics-chart-classes";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
};

/** Glass chart panel — chrome stays mounted; inner chart area skeletons when loading. */
export function AnalyticsChartCard({
  title,
  subtitle,
  icon: Icon,
  loading = false,
  children,
  className,
}: Props) {
  return (
    <Card className={cn(analyticsChartGlassClass, className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {Icon ? <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden /> : null}
          {title}
        </CardTitle>
        {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
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
