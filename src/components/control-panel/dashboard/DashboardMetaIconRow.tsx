"use client";

import type { LucideIcon } from "lucide-react";
import { clinicalCellMutedTextClass } from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
};

/** Muted meta line with leading lucide icon (date, location, etc.). */
export function DashboardMetaIconRow({
  icon: Icon,
  children,
  className,
  iconClassName,
  labelClassName,
}: Props) {
  return (
    <span className={cn("inline-flex min-w-0 max-w-full items-center gap-1", className)}>
      <Icon
        className={cn("h-3.5 w-3.5 shrink-0 text-sky-600/85", iconClassName)}
        aria-hidden
      />
      <span className={cn(clinicalCellMutedTextClass, "min-w-0 truncate", labelClassName)}>
        {children}
      </span>
    </span>
  );
}
