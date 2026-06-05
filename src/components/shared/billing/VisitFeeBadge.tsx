"use client";

import { Euro } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatVisitFeeAmountLabel } from "@/lib/appointment-type-price";
import {
  visitFeeBadgeSizeClass,
  type VisitFeeBadgeSize,
} from "@/lib/visit-fee-badge-ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  priceCents: number;
  /** Surface-specific height — must match sibling type chip (card / wizard / table). */
  size?: VisitFeeBadgeSize;
  className?: string;
  /** Doctor/default fallback — matches appointment card · est. suffix. */
  showEstimateHint?: boolean;
};

/** Emerald visit-fee chip — single € via icon; amount is de-DE digits only (no duplicate € text). */
export function VisitFeeBadge({
  priceCents,
  size = "wizard",
  className,
  showEstimateHint = false,
}: Props) {
  if (priceCents <= 0) return null;

  const estimateSuffix = showEstimateHint ? (
    <span className="text-[9px] font-normal text-emerald-500/90">· est.</span>
  ) : null;

  const inner = (
    <>
      <Euro className="h-3 w-3 shrink-0" aria-hidden />
      {formatVisitFeeAmountLabel(priceCents)}
      {estimateSuffix}
    </>
  );

  /* Card meta uses plain span — same box model as AppointmentTypeGlassBadge (no calendar-glass text-xs). */
  if (size === "cardMeta") {
    return (
      <span className={cn(visitFeeBadgeSizeClass.cardMeta, className)}>{inner}</span>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 calendar-glass-badge calendar-glass-badge-emerald",
        visitFeeBadgeSizeClass[size],
        className
      )}
    >
      {inner}
    </Badge>
  );
}
