"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";
import {
  visitFeeInfoNoteCompactClass,
  visitFeeInfoNotePanelClass,
} from "@/lib/visit-fee-info-note-ui-classes";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  /** `compact` = picker inset; `panel` = services page glow card. */
  variant?: "compact" | "panel";
};

/** Shared visit-fee policy disclaimer — Info icon + sky glass shell. */
export function VisitFeeInfoNoteCard({
  children,
  className,
  variant = "compact",
}: Props) {
  const isPanel = variant === "panel";

  return (
    <div
      className={cn(
        isPanel ? visitFeeInfoNotePanelClass : visitFeeInfoNoteCompactClass,
        className
      )}
    >
      <Info
        className={cn("shrink-0 text-sky-600", isPanel ? "mt-0.5 h-4 w-4" : "mt-0.5 h-3 w-3")}
        aria-hidden
      />
      <p
        className={cn(
          "leading-relaxed text-sky-800",
          isPanel ? "text-sm" : "text-[11px]"
        )}
      >
        {children}
      </p>
    </div>
  );
}
