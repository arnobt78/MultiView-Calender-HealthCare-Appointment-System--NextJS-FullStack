"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scope filter row — org + doctor selects + reset inline; wraps only when viewport is too narrow.
 * No max-width or overflow clip — each control grows to fit its label/content.
 */
export function ScopeFilterInlineRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-wrap items-center justify-end gap-2 md:w-auto",
        className
      )}
    >
      {children}
    </div>
  );
}
