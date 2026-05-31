"use client";

import { RoleEntityLink } from "@/components/shared/RoleEntityLink";
import { CategoryBrandMark } from "@/components/shared/category-display/CategoryBrandMark";
import { cn } from "@/lib/utils";

type CategoryInlineLinkProps = {
  categoryId: string;
  label: string;
  color?: string | null;
  icon?: string | null;
  className?: string;
  wrapLabel?: boolean;
  /** `compact` for cards/timeline; `list` for wider rows. */
  markSize?: "list" | "compact";
};

/** Circular category brand mark + label link — matches CP category table / snapshot cells. */
export function CategoryInlineLink({
  categoryId,
  label,
  color,
  icon,
  className,
  wrapLabel,
  markSize = "compact",
}: CategoryInlineLinkProps) {
  return (
    <span className={cn("inline-flex max-w-full min-w-0 items-center gap-2", className)}>
      <CategoryBrandMark color={color} icon={icon} variant="brand" size={markSize} />
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
