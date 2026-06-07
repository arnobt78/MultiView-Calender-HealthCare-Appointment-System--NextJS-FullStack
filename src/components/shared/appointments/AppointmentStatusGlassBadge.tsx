"use client";

import { createElement } from "react";
import { Badge } from "@/components/ui/badge";
import { resolveAppointmentStatusMeta } from "@/lib/appointment-status-display";
import { cn } from "@/lib/utils";

type Props = {
  status?: string | null;
  /** `compact` = tables/portal rows; `card` = dashboard cards; `detail` = entity detail. */
  size?: "compact" | "card" | "detail";
  showLabel?: boolean;
  className?: string;
};

const SIZE_CLASS = {
  compact: "text-[10px] py-0 gap-1 [&_svg]:h-3 [&_svg]:w-3",
  card: "text-xs py-0.5 gap-1 [&_svg]:h-3.5 [&_svg]:w-3.5",
  detail: "text-xs py-0.5 gap-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5",
} as const;

/**
 * Glass status pill — icon + label with calendar glow shadow (shared across roles/surfaces).
 */
export function AppointmentStatusGlassBadge({
  status,
  size = "compact",
  showLabel = true,
  className,
}: Props) {
  const meta = resolveAppointmentStatusMeta(status);

  return (
    <Badge
      variant="outline"
      className={cn(
        "calendar-glass-badge inline-flex w-fit shrink-0 items-center font-normal capitalize",
        meta.glassClass,
        SIZE_CLASS[size],
        className
      )}
    >
      {createElement(meta.Icon, { className: "shrink-0", "aria-hidden": true })}
      {showLabel ? <span>{meta.label}</span> : null}
    </Badge>
  );
}
