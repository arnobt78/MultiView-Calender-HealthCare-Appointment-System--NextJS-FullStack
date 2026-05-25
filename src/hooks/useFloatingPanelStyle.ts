"use client";

import { type CSSProperties, type RefObject, useCallback, useLayoutEffect, useState } from "react";
import { Z_SELECT_DROPDOWN } from "@/lib/portal-z-index";

type FloatingPanelStyle = CSSProperties & { width: number };

/**
 * Fixed viewport position for portalled menus — escapes `overflow-hidden` cards (`portalPanelCardClass`).
 * Re-syncs on scroll (capture) and resize while `enabled`.
 */
export function useFloatingPanelStyle(
  anchorRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  gapPx = 4
): FloatingPanelStyle | null {
  const [style, setStyle] = useState<FloatingPanelStyle | null>(null);

  const update = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setStyle({
      position: "fixed",
      top: rect.bottom + gapPx,
      left: rect.left,
      width: rect.width,
      zIndex: Z_SELECT_DROPDOWN,
    });
  }, [anchorRef, gapPx]);

  useLayoutEffect(() => {
    if (!enabled) return;
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [enabled, update]);

  return enabled ? style : null;
}
