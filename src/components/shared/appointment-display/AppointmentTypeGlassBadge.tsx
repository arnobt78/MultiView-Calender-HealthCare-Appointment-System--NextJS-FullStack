"use client";

import { cn } from "@/lib/utils";

type Props = {
  name: string;
  /** e.g. "30 min" — omitted when null. */
  durationLabel?: string | null;
  className?: string;
};

/** Visit type chip — pairs with category link on the same meta row. */
export function AppointmentTypeGlassBadge({ name, durationLabel, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full min-w-0 items-center gap-1 rounded-full border border-violet-200/70",
        "bg-violet-50/80 px-2 py-0.5 text-[10px] font-normal text-violet-800 shadow-[0_2px_8px_rgba(139,92,246,0.12)]",
        className
      )}
    >
      <span className="truncate">{name}</span>
      {durationLabel ? (
        <span className="shrink-0 font-normal text-violet-600/90">· {durationLabel}</span>
      ) : null}
    </span>
  );
}
