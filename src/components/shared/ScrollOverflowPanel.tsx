"use client";

import type { ReactNode, RefObject } from "react";
import { ScrollOverflowIndicators } from "@/components/shared/ScrollOverflowIndicators";
import { useScrollOverflowEdges } from "@/hooks/useScrollOverflowEdges";
import { cn } from "@/lib/utils";

type ScrollOverflowPanelProps = {
  children: ReactNode;
  scrollClassName: string;
  className?: string;
  /** When false, skip edge tracking (collapsed picker). */
  enabled?: boolean;
  bottomBounce?: boolean;
  /** Passed to `useScrollOverflowEdges` when list size changes. */
  contentVersion?: number | string;
  role?: string;
  "aria-label"?: string;
};

/**
 * Relative wrapper + scrollable region + top/bottom overflow indicators.
 * Staff pickers pass `px-3` on `scrollClassName` so tile box-shadow is not clipped on the left.
 */
export function ScrollOverflowPanel({
  children,
  scrollClassName,
  className,
  enabled = true,
  bottomBounce = false,
  contentVersion,
  role,
  "aria-label": ariaLabel,
}: ScrollOverflowPanelProps) {
  const { containerRef, canScrollUp, canScrollDown, scrollUp, scrollDown } =
    useScrollOverflowEdges({
      enabled,
      contentVersion,
    });

  return (
    <div className={cn("relative flex min-h-0 min-w-0 w-full flex-col overflow-visible", className)}>
      <ScrollOverflowIndicators
        canScrollUp={canScrollUp}
        canScrollDown={canScrollDown}
        onScrollUp={scrollUp}
        onScrollDown={scrollDown}
        bottomBounce={bottomBounce}
      />
      <div
        ref={containerRef as RefObject<HTMLDivElement | null>}
        className={scrollClassName}
        role={role}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </div>
  );
}
