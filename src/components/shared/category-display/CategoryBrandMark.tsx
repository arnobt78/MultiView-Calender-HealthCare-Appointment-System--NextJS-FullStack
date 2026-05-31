"use client";

import { createElement } from "react";
import {
  categoryBrandColorFill,
  resolveCategoryLucideIcon,
} from "@/lib/category-icon-options";
import { cn } from "@/lib/utils";

type Props = {
  color?: string | null;
  icon?: string | null;
  /** `brand` = colored circle + icon; `dot` = 8px fill-only swatch. */
  variant?: "brand" | "dot";
  /** `hero` = entity detail profile tile (category/patient detail headers). */
  size?: "list" | "compact" | "hero";
  className?: string;
};

const BRAND_SIZE_CLASS = {
  list: "h-7 w-7 [&_svg]:h-3 [&_svg]:w-3",
  compact: "h-6 w-6 [&_svg]:h-2.5 [&_svg]:w-2.5",
  hero: "h-16 w-16 [&_svg]:h-7 [&_svg]:w-7",
} as const;

/**
 * Category color + Lucide icon — circular brand mark; parent cell should use `clinicalTableBrandMarkCellClass`.
 */
export function CategoryBrandMark({
  color,
  icon,
  variant = "brand",
  size = "list",
  className,
}: Props) {
  const fill = categoryBrandColorFill(color);

  if (variant === "dot") {
    return (
      <span className={cn("inline-flex shrink-0 leading-none", className)} aria-hidden>
        <svg width="8" height="8" viewBox="0 0 8 8" className="block">
          <circle cx="4" cy="4" r="4" fill={fill} />
        </svg>
      </span>
    );
  }

  const Icon = resolveCategoryLucideIcon(icon);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        "shadow-[0_2px_8px_rgba(15,23,42,0.14)] ring-1 ring-black/5",
        BRAND_SIZE_CLASS[size],
        className
      )}
      style={{ backgroundColor: fill }}
      aria-hidden
    >
      {createElement(Icon, {
        className: "text-white",
        strokeWidth: 2.25,
        "aria-hidden": true,
      })}
    </span>
  );
}
