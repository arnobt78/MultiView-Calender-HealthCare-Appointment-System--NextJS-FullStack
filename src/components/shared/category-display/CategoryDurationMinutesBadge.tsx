"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  clinicalBadgeInlineClass,
  clinicalBadgeInlineIconClass,
  clinicalCellMutedTextClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";
import { CLINICAL_EMPTY_EM_DASH } from "@/lib/clinical-empty-value";

type Props = {
  minutes: number | null | undefined;
  className?: string;
};

/** Sky duration chip — CP category table + appointment category column parity. */
export function CategoryDurationMinutesBadge({ minutes, className }: Props) {
  if (minutes == null || minutes <= 0) {
    return <span className={clinicalCellMutedTextClass}>{CLINICAL_EMPTY_EM_DASH}</span>;
  }
  return (
    <Badge
      variant="outline"
      className={cn(
        clinicalBadgeInlineClass,
        "border-sky-200 bg-sky-50 text-sky-700",
        className
      )}
    >
      <Clock className={clinicalBadgeInlineIconClass} aria-hidden />
      {minutes} min
    </Badge>
  );
}
