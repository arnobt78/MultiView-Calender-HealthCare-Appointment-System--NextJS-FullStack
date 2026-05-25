"use client";

import { Video } from "lucide-react";
import { cn } from "@/lib/utils";

type TelehealthSessionBadgeProps = {
  className?: string;
};

/** Matches dashboard list cards + doctor-portal upcoming rows. */
export function TelehealthSessionBadge({ className }: TelehealthSessionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border border-sky-200/60 bg-sky-100/80 px-2 py-0.5 text-[10px] font-medium text-sky-700",
        className
      )}
    >
      <Video className="h-3 w-3" aria-hidden />
      Telehealth
    </span>
  );
}
