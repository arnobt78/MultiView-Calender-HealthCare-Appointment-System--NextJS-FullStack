"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AppointmentCardMetaRowProps = {
  icon: ReactNode;
  label?: string;
  children: ReactNode;
  /** When true, value wraps with break-words (popover / month panel). */
  wrap?: boolean;
  className?: string;
};

/** Icon + optional label + value — shared spacing for AppointmentCard meta rows. */
export function AppointmentCardMetaRow({
  icon,
  label,
  children,
  wrap,
  className,
}: AppointmentCardMetaRowProps) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 gap-x-1.5 gap-y-0 text-xs text-gray-600",
        wrap ? "flex-wrap items-start" : "items-center",
        className
      )}
    >
      <span className="inline-flex shrink-0 items-center text-gray-400">{icon}</span>
      {label ? <span className="shrink-0 text-gray-400">{label}</span> : null}
      <span className={cn("min-w-0", wrap && "wrap-anywhere")}>
        {children}
      </span>
    </span>
  );
}
