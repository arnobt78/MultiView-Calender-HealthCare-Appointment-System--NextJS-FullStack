"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn, toTitleCaseLabel } from "@/lib/utils";

type PortalPanelSubsectionHeaderProps = {
  title: string;
  /** Plain string is title-cased; pass JSX for inline emphasis (e.g. timezone). */
  subtitle?: ReactNode;
  icon: LucideIcon;
  iconClassName?: string;
  id?: string;
  className?: string;
};

/**
 * In-card subsection title — icon tile stretches to title + subtitle row height (doctor portal schedule).
 */
export function PortalPanelSubsectionHeader({
  title,
  subtitle,
  icon: Icon,
  iconClassName = "border-sky-100 bg-sky-50 [&_svg]:text-sky-600",
  id,
  className,
}: PortalPanelSubsectionHeaderProps) {
  return (
    <div className={cn("mb-3 flex gap-3", className)}>
      <span
        className={cn(
          "flex w-10 shrink-0 items-center justify-center self-stretch rounded-xl border",
          iconClassName
        )}
        aria-hidden
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <h4 id={id} className="text-sm font-semibold text-gray-800">
          {toTitleCaseLabel(title)}
        </h4>
        {subtitle ? (
          <p className="text-xs leading-snug text-muted-foreground">
            {typeof subtitle === "string" ? toTitleCaseLabel(subtitle) : subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
