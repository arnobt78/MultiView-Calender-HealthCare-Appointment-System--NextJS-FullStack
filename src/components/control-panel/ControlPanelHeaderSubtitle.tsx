"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { pageHeaderDescriptionClass } from "@/lib/page-chrome-classes";
import { cn } from "@/lib/utils";

type Props = {
  /** Static lead — always visible (no swap on load). */
  lead: string;
  /** Trailing metric text when warm (e.g. time or count). */
  metric?: string;
  /** Pulse inline skeleton for metric segment only. */
  metricLoading?: boolean;
  /** Suffix after metric (e.g. " total notifications"). */
  metricSuffix?: string;
  /** When true, always reserve inline metric space (skeleton or value) after lead. */
  showMetricSlot?: boolean;
  className?: string;
};

/**
 * CP merged-header subtitle — one sentence: static lead + optional inline metric skeleton.
 * Register via ControlPanelPageChrome `description` on every render (never undefined).
 */
export function ControlPanelHeaderSubtitle({
  lead,
  metric,
  metricLoading = false,
  metricSuffix = "",
  showMetricSlot = false,
  className,
}: Props) {
  const showMetric = showMetricSlot || metricLoading || metric !== undefined;

  return (
    <div className={cn(pageHeaderDescriptionClass, className)}>
      {lead}
      {showMetric ? (
        <>
          {" "}
          {metricLoading ? (
            <Skeleton
              className="inline-block h-4 w-[4.5rem] align-middle rounded"
              aria-hidden
            />
          ) : (
            <span suppressHydrationWarning>
              {metric}
              {metricSuffix}
            </span>
          )}
        </>
      ) : null}
    </div>
  );
}
