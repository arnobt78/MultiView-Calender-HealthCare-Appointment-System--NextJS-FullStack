"use client";

import { useEffect, useRef } from "react";

/**
 * Vertical color accent on the left edge of appointment list rows (dashboard list view).
 * Mirrors the implementation previously local to `AppointmentList.tsx` — uses a ref so
 * the bar color can be set from a dynamic hex without tripping style-lint on inline CSS.
 */
export function AppointmentListColorBar({ color }: { color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.style.backgroundColor = color;
  }, [color]);
  return (
    <div
      ref={ref}
      className="pointer-events-none absolute left-0 top-0 bottom-0 w-2 rounded-l-2xl transition-colors"
      aria-hidden
    />
  );
}
