/**
 * Server-only page chrome markup — mirrors `AppPageChrome` layout without client hooks.
 * Used by `ControlPanelSectionChromeServer` for zero-JS header shell on CP list routes.
 */

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PAGE_CHROME_TONE_CLASSES,
  type PageChromeTone,
  pageChromeTitleStackClass,
  pageHeaderDescriptionClass,
  pageHeaderRootClass,
  pageHeaderTitleClass,
} from "@/lib/page-chrome-classes";

type AppPageChromeServerProps = {
  variant?: "control-panel" | "portal";
  icon?: LucideIcon;
  tone?: PageChromeTone;
  title: string;
  description?: string;
  className?: string;
};

export function AppPageChromeServer({
  variant = "control-panel",
  icon: Icon,
  tone = "sky",
  title,
  description,
  className,
}: AppPageChromeServerProps) {
  const toneClasses = PAGE_CHROME_TONE_CLASSES[tone];
  const isCp = variant === "control-panel";

  return (
    <div
      className={cn(
        pageHeaderRootClass,
        "border-b border-gray-100/80",
        className
      )}
      data-cp-chrome-server=""
    >
      <div className="flex min-w-0 flex-1 items-stretch gap-2">
        {Icon ? (
          <span className={toneClasses.tile} aria-hidden>
            <Icon className={toneClasses.icon} />
          </span>
        ) : null}
        <div className={pageChromeTitleStackClass}>
          {isCp ? (
            <div role="heading" aria-level={1} className={pageHeaderTitleClass}>
              {title}
            </div>
          ) : (
            <h1 className={pageHeaderTitleClass}>{title}</h1>
          )}
          {description ? (
            <div className={pageHeaderDescriptionClass}>{description}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
