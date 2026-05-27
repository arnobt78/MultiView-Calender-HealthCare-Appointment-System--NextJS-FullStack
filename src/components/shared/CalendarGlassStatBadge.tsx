"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Token suffix for `calendar-glass-badge-*` in globals.css — matches dashboard list/month headers. */
export type CalendarGlassStatBadgeVariant =
  | "sky"
  | "emerald"
  | "blue"
  | "violet"
  | "amber"
  | "rose"
  | "slate";

const VARIANT_CLASS: Record<CalendarGlassStatBadgeVariant, string> = {
  sky: "calendar-glass-badge-sky",
  emerald: "calendar-glass-badge-emerald",
  blue: "calendar-glass-badge-blue",
  violet: "calendar-glass-badge-violet",
  amber: "calendar-glass-badge-amber",
  rose: "calendar-glass-badge-rose",
  slate: "calendar-glass-badge-slate",
};

type Props = {
  label: string;
  value: number;
  variant?: CalendarGlassStatBadgeVariant;
  loading?: boolean;
  className?: string;
};

/** Dashboard-style glass count pill — `Total: 6`, `Today: 0`, etc. */
export function CalendarGlassStatBadge({
  label,
  value,
  variant = "sky",
  loading = false,
  className,
}: Props) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "calendar-glass-badge min-h-6 min-w-[5.5rem] justify-center font-normal tabular-nums",
        VARIANT_CLASS[variant],
        className
      )}
    >
      {label}:{" "}
      {loading ? <Skeleton className="ml-1 inline-block h-3.5 w-6 align-middle" /> : value}
    </Badge>
  );
}
