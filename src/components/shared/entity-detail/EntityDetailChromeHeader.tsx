"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  entityDetailChromeSkyIconClass,
  entityDetailChromeSkyIconTileClass,
  pageChromeDescriptionClass,
  pageChromeHeaderShellClass,
  pageChromeTitleClass,
  pageChromeTitleStackClass,
} from "@/lib/page-chrome-classes";

type EntityDetailChromeHeaderProps = {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  /** Back button or other right-slot actions. */
  actions?: ReactNode;
  iconTileClassName?: string;
  iconClassName?: string;
  /** Sticky fade — pass `pageHeaderEntityDetailClass` on entity detail pages. */
  className?: string;
};

/**
 * Entity detail top chrome — portal parity (`PortalChromeHeader`): icon tile + title/subtitle + border-b.
 * Used on appointment, invoice, doctor, and category detail routes.
 */
export function EntityDetailChromeHeader({
  icon: Icon,
  title,
  description,
  actions,
  iconTileClassName = entityDetailChromeSkyIconTileClass,
  iconClassName = entityDetailChromeSkyIconClass,
  className,
}: EntityDetailChromeHeaderProps) {
  return (
    <div className={cn(pageChromeHeaderShellClass, className)}>
      <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-stretch md:justify-between">
        <div className="flex min-w-0 flex-1 items-stretch gap-2">
          <span className={iconTileClassName}>
            <Icon className={iconClassName} aria-hidden />
          </span>
          <div className={pageChromeTitleStackClass}>
            <h1 className={pageChromeTitleClass}>{title}</h1>
            {description ? (
              <p className={pageChromeDescriptionClass}>{description}</p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
