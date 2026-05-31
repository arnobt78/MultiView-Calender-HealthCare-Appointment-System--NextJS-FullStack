"use client";

import { CircleCheck, CircleOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  clinicalBadgeInlineClass,
  clinicalBadgeInlineIconClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

/**
 * Shared Active / Inactive pill — spacing matches Default Duration badge (`gap-1`, 12px icon).
 */
export function EntityActiveStatusBadge({ active }: { active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        clinicalBadgeInlineClass,
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-600"
      )}
    >
      {active ? (
        <CircleCheck className={clinicalBadgeInlineIconClass} aria-hidden />
      ) : (
        <CircleOff className={clinicalBadgeInlineIconClass} aria-hidden />
      )}
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}
