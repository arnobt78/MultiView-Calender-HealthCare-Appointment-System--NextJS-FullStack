"use client";

import type { ReactNode } from "react";
import { EntityListSearchInput } from "@/components/shared/EntityListSearchInput";
import { GlassResetFilterButton } from "@/components/shared/GlassResetFilterButton";
import {
  clinicalListFilterResetButtonClass,
  clinicalListFilterToolbarClass,
} from "@/lib/clinical-list-filter-toolbar-classes";
import { cn } from "@/lib/utils";

type ClinicalListFilterToolbarProps = {
  /** When set, renders shared search input (CP list pages). Dashboard calendar omits this. */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    ariaLabel: string;
    className?: string;
  };
  children?: ReactNode;
  showReset: boolean;
  onReset: () => void;
  /** e.g. APP_INNER_SCROLL_STICKY_TOP_CLASS on CP tabs */
  stickyClassName?: string;
  className?: string;
};

/**
 * Control-panel + dashboard filter row — Reset uses `ml-auto` so filters stay left, reset stays right.
 */
export function ClinicalListFilterToolbar({
  search,
  children,
  showReset,
  onReset,
  stickyClassName,
  className,
}: ClinicalListFilterToolbarProps) {
  return (
    <div className={cn(clinicalListFilterToolbarClass, stickyClassName, className)}>
      {search ? (
        <EntityListSearchInput
          value={search.value}
          onChange={search.onChange}
          placeholder={search.placeholder}
          ariaLabel={search.ariaLabel}
          className={search.className}
        />
      ) : null}
      {children}
      {showReset ? (
        <GlassResetFilterButton
          onClick={onReset}
          className={clinicalListFilterResetButtonClass}
        />
      ) : null}
    </div>
  );
}
