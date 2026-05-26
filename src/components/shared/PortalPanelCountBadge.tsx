"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PortalPanelCountBadgeProps = {
  children: ReactNode;
  className?: string;
};

/** Inline count pill beside portal section titles — not `ml-auto` (avoids justify-between header). */
export function PortalPanelCountBadge({ children, className }: PortalPanelCountBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("shrink-0 text-xs font-normal tabular-nums", className)}
    >
      {children}
    </Badge>
  );
}
