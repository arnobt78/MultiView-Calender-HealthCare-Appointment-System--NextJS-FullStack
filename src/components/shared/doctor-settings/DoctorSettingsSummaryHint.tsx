"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  icon?: LucideIcon;
  tone?: "sky" | "amber";
  children: ReactNode;
  className?: string;
};

/** Collapsed `<details>` subtitle row — leading icon + wrap-friendly text. */
export function DoctorSettingsSummaryHint({
  icon: Icon = Clock,
  tone = "sky",
  children,
  className,
}: Props) {
  const iconClass = tone === "amber" ? "text-amber-600" : "text-sky-600";
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      <Icon className={cn("h-3 w-3 shrink-0", iconClass)} aria-hidden />
      <span className="min-w-0 break-words">{children}</span>
    </span>
  );
}
