"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  scrollOverflowChevronButtonClass,
  scrollOverflowOverlayBottomClass,
  scrollOverflowOverlayTopClass,
} from "@/lib/scroll-overflow-ui-classes";

type ScrollOverflowIndicatorsProps = {
  canScrollUp: boolean;
  canScrollDown: boolean;
  onScrollUp: () => void;
  onScrollDown: () => void;
  /** Bounce animation on bottom chevron (CP sidebar). */
  bottomBounce?: boolean;
  className?: string;
};

/**
 * Top/bottom circular chevrons over a scroll container (no gradient band — matches up/down parity).
 * CP sidebar keeps its own gradient row via `scrollOverflowBottomGradientClass`.
 */
export function ScrollOverflowIndicators({
  canScrollUp,
  canScrollDown,
  onScrollUp,
  onScrollDown,
  bottomBounce = false,
  className,
}: ScrollOverflowIndicatorsProps) {
  return (
    <>
      {canScrollUp ? (
        <div className={cn(scrollOverflowOverlayTopClass, className)}>
          <button
            type="button"
            onClick={onScrollUp}
            aria-label="Scroll list up"
            className={cn(scrollOverflowChevronButtonClass, "pointer-events-auto mt-1")}
          >
            <ChevronDown className="size-3.5 rotate-180" aria-hidden />
          </button>
        </div>
      ) : null}
      {canScrollDown ? (
        <div className={cn(scrollOverflowOverlayBottomClass, className)}>
          <button
            type="button"
            onClick={onScrollDown}
            aria-label="Scroll list down"
            className={cn(
              scrollOverflowChevronButtonClass,
              "pointer-events-auto mb-1",
              bottomBounce && "animate-bounce"
            )}
          >
            <ChevronDown className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : null}
    </>
  );
}
