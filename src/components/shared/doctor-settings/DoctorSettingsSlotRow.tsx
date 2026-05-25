"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "sky" | "amber";

const iconToneClass: Record<Tone, string> = {
  sky: "text-sky-600",
  amber: "text-amber-600",
};

type Props = {
  icon: LucideIcon;
  tone?: Tone;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/** One availability/time-off line — leading icon + label + trailing edit/delete. */
export function DoctorSettingsSlotRow({
  icon: Icon,
  tone = "sky",
  children,
  actions,
  className,
}: Props) {
  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/80 bg-white/70 shadow-sm",
            iconToneClass[tone]
          )}
          aria-hidden
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 text-sm font-medium text-gray-700">{children}</div>
      </div>
      {actions ? <div className="flex shrink-0 gap-0.5">{actions}</div> : null}
    </div>
  );
}
