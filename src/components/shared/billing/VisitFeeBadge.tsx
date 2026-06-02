"use client";

import { Euro } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatVisitFeeAmountLabel } from "@/lib/appointment-type-price";
import { cn } from "@/lib/utils";

type Props = {
  priceCents: number;
  className?: string;
};

/** Emerald visit-fee chip — single € prefix via icon; amount uses de-DE grouping only. */
export function VisitFeeBadge({ priceCents, className }: Props) {
  if (priceCents <= 0) return null;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 text-xs calendar-glass-badge-emerald", className)}
    >
      <Euro className="h-3 w-3 shrink-0" aria-hidden />
      {formatVisitFeeAmountLabel(priceCents)}
    </Badge>
  );
}
