"use client";

import { Badge } from "@/components/ui/badge";
import { portalPanelStatusOutlineChipClass } from "@/lib/portal-panel-status-chip";
import { cn } from "@/lib/utils";

type Props = {
  children: string;
  className?: string;
};

export function PortalPanelStatusOutlineChip({ children, className }: Props) {
  return (
    <Badge variant="outline" className={cn(portalPanelStatusOutlineChipClass, className)}>
      {children}
    </Badge>
  );
}
