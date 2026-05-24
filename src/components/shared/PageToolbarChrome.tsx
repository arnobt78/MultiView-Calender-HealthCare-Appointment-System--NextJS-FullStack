"use client";

import { cn } from "@/lib/utils";
import {
  pageChromeToolbarOnlyInnerClass,
  pageChromeToolbarOnlyShellClass,
} from "@/lib/page-chrome-classes";

type PageToolbarChromeProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Toolbar-only page chrome — `/dashboard` calendar header (no icon/title row).
 * `min-h-[3.5rem]` matches portal icon-tile height; no `border-b` (appointment filters sit directly below).
 */
export function PageToolbarChrome({ children, className }: PageToolbarChromeProps) {
  return (
    <div className={cn(pageChromeToolbarOnlyShellClass, className)}>
      <div className={pageChromeToolbarOnlyInnerClass}>{children}</div>
    </div>
  );
}
