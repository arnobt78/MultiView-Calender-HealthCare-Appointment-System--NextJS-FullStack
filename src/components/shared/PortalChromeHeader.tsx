"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  pageChromeDescriptionClass,
  pageChromeHeaderShellClass,
  pageChromeIconClass,
  pageChromeIconTileClass,
  pageChromeTitleClass,
  pageChromeToolbarRowClass,
} from "@/lib/page-chrome-classes";

type PortalChromeHeaderProps = {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  /** Right slot on the title row — e.g. Book Appointment on patient portal */
  actions?: React.ReactNode;
  /** Second row — dashboard calendar toolbar (date nav, view tabs, role actions) */
  toolbar?: React.ReactNode;
  className?: string;
};

/**
 * Page chrome for `/services`, `/patient-portal`, `/dashboard`, `/insights`, etc.
 * Static shell always mounts; only inner page data slots pulse elsewhere.
 */
export function PortalChromeHeader({
  icon: Icon,
  title,
  description,
  actions,
  toolbar,
  className,
}: PortalChromeHeaderProps) {
  return (
    <div className={cn(pageChromeHeaderShellClass, className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-stretch md:justify-between">
        <div className="flex min-w-0 flex-1 items-stretch gap-2">
          <span className={pageChromeIconTileClass}>
            <Icon className={pageChromeIconClass} aria-hidden />
          </span>
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <h1 className={pageChromeTitleClass}>{title}</h1>
            <p className={pageChromeDescriptionClass}>{description}</p>
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center">{actions}</div> : null}
      </div>
      {toolbar ? <div className={pageChromeToolbarRowClass}>{toolbar}</div> : null}
    </div>
  );
}
