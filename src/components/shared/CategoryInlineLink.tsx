"use client";

import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { categorySwatchFill } from "@/lib/appointment-card";
import { cn } from "@/lib/utils";

type CategoryInlineLinkProps = {
  categoryId: string;
  label: string;
  color?: string | null;
  className?: string;
  wrapLabel?: boolean;
};

/** Color swatch + category label link — same visual as control-panel CategoryTableCell. */
export function CategoryInlineLink({
  categoryId,
  label,
  color,
  className,
  wrapLabel,
}: CategoryInlineLinkProps) {
  return (
    <span className={cn("inline-flex max-w-full min-w-0 items-center gap-1.5", className)}>
      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden className="inline-block shrink-0">
        <circle cx="4" cy="4" r="4" fill={categorySwatchFill(color)} />
      </svg>
      <RoleEntityLink
        kind="category"
        id={categoryId}
        label={label}
        wrapLabel={wrapLabel}
        className="text-xs font-medium"
      />
    </span>
  );
}
