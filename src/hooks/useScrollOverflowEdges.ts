"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCROLL_EDGE_THRESHOLD_PX = 4;
const DEFAULT_SCROLL_STEP_PX = 120;

export type UseScrollOverflowEdgesOptions = {
  /** When false, listeners detach and edges read false (e.g. collapsed picker). */
  enabled?: boolean;
  scrollStepPx?: number;
  /** Bump when list length or layout changes so ResizeObserver re-checks edges. */
  contentVersion?: number | string;
};

/**
 * Tracks whether a scroll container has hidden content above/below the viewport.
 * Mirrors `ControlPanelSidebarNav` — used by list pickers and optional CP refactor.
 */
export function useScrollOverflowEdges(options?: UseScrollOverflowEdgesOptions) {
  const { enabled = true, scrollStepPx = DEFAULT_SCROLL_STEP_PX, contentVersion } = options ?? {};
  const containerRef = useRef<HTMLElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkEdges = useCallback(() => {
    const el = containerRef.current;
    if (!el || !enabled) {
      setCanScrollUp(false);
      setCanScrollDown(false);
      return;
    }
    setCanScrollUp(el.scrollTop > SCROLL_EDGE_THRESHOLD_PX);
    setCanScrollDown(
      el.scrollTop + el.clientHeight < el.scrollHeight - SCROLL_EDGE_THRESHOLD_PX
    );
  }, [enabled]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) {
      setCanScrollUp(false);
      setCanScrollDown(false);
      return;
    }

    checkEdges();
    el.addEventListener("scroll", checkEdges, { passive: true });
    const ro = new ResizeObserver(checkEdges);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", checkEdges);
      ro.disconnect();
    };
  }, [checkEdges, enabled, contentVersion]);

  const scrollUp = useCallback(() => {
    containerRef.current?.scrollBy({ top: -scrollStepPx, behavior: "smooth" });
  }, [scrollStepPx]);

  const scrollDown = useCallback(() => {
    containerRef.current?.scrollBy({ top: scrollStepPx, behavior: "smooth" });
  }, [scrollStepPx]);

  return {
    containerRef,
    canScrollUp,
    canScrollDown,
    scrollUp,
    scrollDown,
  };
}
