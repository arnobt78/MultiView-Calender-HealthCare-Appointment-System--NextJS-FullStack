"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<string, string> = {
  draft: "calendar-glass-badge-slate",
  sent: "calendar-glass-badge-sky",
  paid: "calendar-glass-badge-emerald",
  overdue: "calendar-glass-badge-rose",
  cancelled: "calendar-glass-badge-amber",
};

type Props = {
  status: string;
  className?: string;
};

export function InvoiceStatusBadge({ status, className }: Props) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "calendar-glass-badge text-[10px] py-0 capitalize",
        STATUS_CLASS[status] ?? "calendar-glass-badge-slate",
        className
      )}
    >
      {status}
    </Badge>
  );
}
