"use client";

import { createElement } from "react";
import { CalendarCheck2, Unplug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  connected: boolean;
  className?: string;
};

/** Glass glow badge — emerald when linked, slate when disconnected (Connection Status card). */
export function GoogleCalendarConnectionGlassBadge({ connected, className }: Props) {
  const Icon = connected ? CalendarCheck2 : Unplug;

  return (
    <Badge
      variant="outline"
      className={cn(
        "calendar-glass-badge inline-flex w-fit shrink-0 items-center gap-1.5 py-0.5 text-xs font-normal",
        connected ? "calendar-glass-badge-emerald" : "calendar-glass-badge-slate",
        className
      )}
    >
      {createElement(Icon, { className: "h-3.5 w-3.5 shrink-0", "aria-hidden": true })}
      <span>{connected ? "Connected" : "Not connected"}</span>
    </Badge>
  );
}
