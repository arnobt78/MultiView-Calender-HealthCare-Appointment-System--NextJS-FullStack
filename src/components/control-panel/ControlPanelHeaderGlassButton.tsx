"use client";

import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Glass preset from calendar-header-action-styles (includes h-10 gap-2 px-4). */
  glassClassName: string;
  icon?: LucideIcon;
  children: ReactNode;
};

/**
 * CP header action button — matches SSR shell dimensions (h-10, gap-2, px-4, icon size-4).
 * Use instead of shadcn Button size="lg"/"sm" on merged header rows to avoid layout shift.
 */
export function ControlPanelHeaderGlassButton({
  glassClassName,
  icon: Icon,
  children,
  className,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        glassClassName,
        "cursor-pointer disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="shrink-0" aria-hidden /> : null}
      {children}
    </button>
  );
}
