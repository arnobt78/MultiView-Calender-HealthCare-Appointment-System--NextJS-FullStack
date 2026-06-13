"use client";

import { cn } from "@/lib/utils";
import { getNotificationTypeConfig } from "@/lib/notification-type-display";

type Props = {
  type: string;
  className?: string;
};

/** Glass type badge — shared CP list + navbar parity. */
export function NotificationTypeBadge({ type, className }: Props) {
  const cfg = getNotificationTypeConfig(type);
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        cfg.badgeClass,
        className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5 shrink-0", cfg.iconColor)} aria-hidden />
      {cfg.label}
    </span>
  );
}
