"use client";

import { type RefObject, useEffect, useRef } from "react";

/**
 * Closes overlays when the user clicks/taps outside `containerRef` (Radix Select dismiss parity).
 */
export function useDismissOnPointerDownOutside(
  containerRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  onDismiss: () => void
) {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!enabled) return;

    function handlePointerDown(event: PointerEvent) {
      const root = containerRef.current;
      if (!root || root.contains(event.target as Node)) return;
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
