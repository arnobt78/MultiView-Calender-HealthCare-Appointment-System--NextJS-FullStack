"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnalyticsChartPanelHeader } from "@/components/shared/analytics/AnalyticsChartPanelHeader";
import {
  controlPanelDashboardPanelGlassClass,
  controlPanelDashboardQueueCardShellClass,
} from "@/lib/control-panel-glass-card";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconClassName?: string;
  /** Shown inline beside title (portal Weekly Hours parity). */
  count?: number;
  children: React.ReactNode;
  className?: string;
};

/**
 * Dashboard overview queue panel — insights Top Patients header parity (icon tile + stacked title/subtitle).
 * Card chrome stays mounted; parent passes inline skeleton or list body.
 */
export function DashboardQueuePanelCard({
  title,
  subtitle,
  icon,
  iconClassName,
  count,
  children,
  className,
}: Props) {
  const headingId = `dashboard-queue-${title.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <Card
      className={cn(
        controlPanelDashboardPanelGlassClass,
        controlPanelDashboardQueueCardShellClass,
        "gap-0",
        className
      )}
    >
      <CardContent className="flex flex-1 flex-col p-4 text-gray-700">
        <AnalyticsChartPanelHeader
          id={headingId}
          title={title}
          periodSubtitle={subtitle}
          count={count}
          icon={icon}
          iconClassName={iconClassName}
          className="mb-2 shrink-0"
        />
        <div className="min-h-0 flex-1">{children}</div>
      </CardContent>
    </Card>
  );
}
