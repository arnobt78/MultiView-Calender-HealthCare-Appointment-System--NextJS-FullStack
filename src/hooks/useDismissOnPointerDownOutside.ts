"use client";

import { type RefObject, useEffect, useRef } from "react";

/**
 * Closes overlays when the user clicks/taps outside `containerRef` (Radix Select dismiss parity).
 */
export function useDismissOnPointerDownOutside(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onDismiss: () => void,
  /** Portalled panel nodes — clicks inside must not dismiss (e.g. `GlassInlineSelect`). */
  extraRefs?: readonly RefObject<HTMLElement | null>[]
) {
  const onDismissRef = useRef(onDismiss);
  const extraRefsRef = useRef(extraRefs);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);
  useEffect(() => {
    extraRefsRef.current = extraRefs;
  });

  useEffect(() => {
    if (!enabled) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      const roots = [
        containerRef.current,
        ...(extraRefsRef.current?.map((r) => r.current) ?? []),
      ].filter((n): n is HTMLElement => n != null);
      if (roots.some((root) => root.contains(target))) return;
      onDismissRef.current();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onDismissRef.current();
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, enabled]);
}
