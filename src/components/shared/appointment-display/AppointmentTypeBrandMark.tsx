"use client";

import { createElement } from "react";
import {
  appointmentTypeBrandMarkStyles,
  resolveAppointmentTypeLucideIcon,
} from "@/lib/appointment-type-icon-options";
import { cn } from "@/lib/utils";

type Props = {
  icon?: string | null;
  color?: string | null;
  /** `catalog` = /services card; `dropdown` = filter select; `compact` = inline rows. */
  size?: "catalog" | "dropdown" | "compact";
  className?: string;
};

const SIZE_CLASS = {
  catalog: "h-11 w-11 rounded-xl [&_svg]:h-5 [&_svg]:w-5",
  dropdown: "h-7 w-7 rounded-lg [&_svg]:h-3.5 [&_svg]:w-3.5",
  compact: "h-6 w-6 rounded-full [&_svg]:h-3 [&_svg]:w-3",
} as const;

/**
 * Appointment type icon tile — light brand tint + matching border/icon (entity detail field parity).
 */
export function AppointmentTypeBrandMark({
  icon,
  color,
  size = "catalog",
  className,
}: Props) {
  const Icon = resolveAppointmentTypeLucideIcon(icon);
  const { containerStyle, iconColor } = appointmentTypeBrandMarkStyles(color);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.08)]",
        SIZE_CLASS[size],
        className
      )}
      style={containerStyle}
      aria-hidden
    >
      {createElement(Icon, {
        style: { color: iconColor },
        strokeWidth: 2.25,
        "aria-hidden": true,
      })}
    </span>
  );
}
