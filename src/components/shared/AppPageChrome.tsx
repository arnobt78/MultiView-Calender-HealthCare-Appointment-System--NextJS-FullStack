"use client";

/**
 * Unified page header chrome — portal, control-panel, and entity-detail variants.
 * Title/subtitle stack has no extra gap (see `pageChromeTitleStackClass`).
 * Form parity: mandatory `FormRequiredMark`, `ClinicalGlassDatePicker align="end"`,
 * doctor picker via `DoctorDirectoryPickerCard` + `StaffAppointmentPickerField`.
 */

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn, toTitleCaseLabel } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PAGE_CHROME_TONE_CLASSES,
  type PageChromeTone,
  pageChromeDescriptionClass,
  pageChromeHeaderShellClass,
  pageChromeTitleStackClass,
  pageChromeToolbarRowClass,
  pageHeaderDescriptionClass,
  pageHeaderEntityDetailClass,
  pageHeaderRootClass,
  pageHeaderTitleClass,
  pageChromeTitleClass,
} from "@/lib/page-chrome-classes";

export type AppPageChromeVariant = "portal" | "control-panel" | "entity-detail";

export type AppPageChromeProps = {
  variant?: AppPageChromeVariant;
  icon?: LucideIcon;
  tone?: PageChromeTone;
  iconTileClassName?: string;
  iconClassName?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  /** Replaces `icon` tile — e.g. doctor avatar square on portal chrome. */
  leading?: ReactNode;
  /** Inline after title — e.g. specialty badge. */
  titleAddon?: ReactNode;
  /** Right column before `actions` — e.g. doctor portal "Today" block. */
  aside?: ReactNode;
  /** CP list pages stick under navbar while scrolling table content. */
  sticky?: boolean;
  borderBottom?: boolean;
  loading?: boolean;
  className?: string;
};

function resolveToneClasses(
  tone: PageChromeTone | undefined,
  iconTileClassName?: string,
  iconClassName?: string
) {
  if (iconTileClassName && iconClassName) {
    return { tile: iconTileClassName, icon: iconClassName };
  }
  const key = tone ?? "sky";
  return PAGE_CHROME_TONE_CLASSES[key];
}

export function AppPageChrome({
  variant = "portal",
  icon: Icon,
  tone = "sky",
  iconTileClassName,
  iconClassName,
  title,
  description,
  actions,
  toolbar,
  leading,
  titleAddon,
  aside,
  sticky,
  borderBottom,
  loading = false,
  className,
}: AppPageChromeProps) {
  const isPortal = variant === "portal";
  const isCp = variant === "control-panel";
  const isEntity = variant === "entity-detail";

  /** CP list headers omit border-b — body `space-y-3` provides separation (portal/entity keep border). */
  const useBorder = borderBottom ?? (isPortal || isEntity);
  const useSticky = sticky ?? isCp;

  const toneClasses = resolveToneClasses(tone, iconTileClassName, iconClassName);

  const titleClass = isPortal || isEntity ? pageChromeTitleClass : pageHeaderTitleClass;
  const descriptionClass =
    isPortal || isEntity ? pageChromeDescriptionClass : pageHeaderDescriptionClass;

  const shellClass = cn(
    isPortal || (useBorder && !useSticky)
      ? pageChromeHeaderShellClass
      : cn(
          pageHeaderRootClass,
          useBorder && "border-b border-gray-100/80",
          isEntity && pageHeaderEntityDetailClass
        ),
    !useSticky && isCp && "relative",
    className
  );

  if (loading) {
    return (
      <div className={shellClass}>
        <div className="flex min-w-0 flex-1 items-stretch gap-2">
          {Icon ? <Skeleton className="h-14 w-12 shrink-0 rounded-xl" /> : null}
          <div className={pageChromeTitleStackClass}>
            <Skeleton className="h-7 w-64 max-w-full" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
        </div>
        {actions ? <Skeleton className="h-10 w-32 shrink-0" /> : null}
      </div>
    );
  }

  const titleNode =
    typeof title === "string" && isPortal ? toTitleCaseLabel(title) : title;

  return (
    <div className={shellClass}>
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-stretch md:justify-between",
          isCp && "sm:flex-row sm:items-center"
        )}
      >
        <div className="flex min-w-0 flex-1 items-stretch gap-2">
          {leading ? (
            leading
          ) : Icon ? (
            <span className={toneClasses.tile} aria-hidden>
              <Icon className={toneClasses.icon} />
            </span>
          ) : null}
          <div className={pageChromeTitleStackClass}>
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              {isPortal ? (
                <h1 className={titleClass}>{titleNode}</h1>
              ) : (
                <div role="heading" aria-level={1} className={titleClass}>
                  {titleNode}
                </div>
              )}
              {titleAddon}
            </div>
            {description ? (
              <div className={descriptionClass}>{description}</div>
            ) : null}
          </div>
        </div>
        {aside}
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 self-center">
            {actions}
          </div>
        ) : null}
      </div>
      {toolbar ? <div className={pageChromeToolbarRowClass}>{toolbar}</div> : null}
    </div>
  );
}
