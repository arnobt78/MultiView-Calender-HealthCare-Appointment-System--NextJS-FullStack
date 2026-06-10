"use client";

import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  clinicalBadgeInlineClass,
  clinicalBadgeInlineIconClass,
} from "@/lib/table-display-styles";
import { cn } from "@/lib/utils";

/** Email verification pill — height/icon rhythm matches EntityActiveStatusBadge. */
export function EntityEmailVerificationBadge({ verified }: { verified: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        clinicalBadgeInlineClass,
        verified
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      )}
    >
      {verified ? (
        <ShieldCheck className={clinicalBadgeInlineIconClass} aria-hidden />
      ) : (
        <ShieldAlert className={clinicalBadgeInlineIconClass} aria-hidden />
      )}
      {verified ? "Verified" : "Unverified"}
    </Badge>
  );
}
