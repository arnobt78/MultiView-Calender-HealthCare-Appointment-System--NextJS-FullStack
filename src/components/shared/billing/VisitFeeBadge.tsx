"use client";

import { Euro } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatInvoiceMoney } from "@/lib/crud-notify-messages";

type Props = {
  priceCents: number;
  className?: string;
};

/** Emerald visit-fee chip — booking picker, services catalog, appointment cards. */
export function VisitFeeBadge({ priceCents, className }: Props) {
  if (priceCents <= 0) return null;

  const label = formatInvoiceMoney({
    amount: priceCents,
    currency: "eur",
    unit: "cents",
  });

  return (
    <Badge
      variant="outline"
      className={`gap-1 text-xs calendar-glass-badge-emerald ${className ?? ""}`}
    >
      <Euro className="h-3 w-3" aria-hidden />
      {label}
    </Badge>
  );
}
