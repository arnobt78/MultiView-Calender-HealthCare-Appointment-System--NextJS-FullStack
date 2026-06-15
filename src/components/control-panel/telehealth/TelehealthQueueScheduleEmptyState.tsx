"use client";

import type { LucideIcon } from "lucide-react";
import { telehealthQueueScheduleEmptyShellClass } from "@/lib/telehealth-queue-ui-classes";
import type { TelehealthQueueEmptyCopy } from "@/lib/telehealth-queue-empty-copy";
import { cn } from "@/lib/utils";

type Props = {
  icon: LucideIcon;
  copy: TelehealthQueueEmptyCopy;
  className?: string;
};

/** Centered empty shell inside schedule panel body (sky tone, Up Next parity). */
export function TelehealthQueueScheduleEmptyState({ icon: Icon, copy, className }: Props) {
  return (
    <div
      className={cn(
        "flex min-h-[min(280px,40vh)] flex-1 items-center justify-center",
        className
      )}
      role="status"
    >
      <div className={telehealthQueueScheduleEmptyShellClass}>
        <Icon className="mb-3 size-10 text-sky-300" aria-hidden />
        <p className="text-base font-medium text-muted-foreground">{copy.title}</p>
        <p className="text-xs text-muted-foreground">{copy.subtitle}</p>
      </div>
    </div>
  );
}
