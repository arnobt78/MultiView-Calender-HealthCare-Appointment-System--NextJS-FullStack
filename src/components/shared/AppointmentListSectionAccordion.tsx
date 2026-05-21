"use client";

/**
 * Collapsible Today / Tomorrow / Passed / Later section — shared by dashboard list + portal history.
 */

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AppointmentListSectionUiConfig } from "@/lib/appointment-list-sections";
import { cn } from "@/lib/utils";

export type AppointmentListSectionAccordionProps = {
  section: AppointmentListSectionUiConfig;
  icon: ReactNode;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
};

export function AppointmentListSectionAccordion({
  section,
  icon,
  count,
  collapsed,
  onToggle,
  children,
  className,
}: AppointmentListSectionAccordionProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border",
        section.headerClass,
        className
      )}
    >
      <button
        type="button"
        aria-expanded={!collapsed}
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-white/35"
      >
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-2xl border",
            section.iconClass
          )}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-gray-700">{section.title}</p>
            <Badge variant="outline" className={cn("border-transparent", section.countClass)}>
              {count}
            </Badge>
          </div>
          <p className="text-xs text-gray-500">{section.subtitle}</p>
        </div>
        <span className="inline-flex h-7 w-24 shrink-0 items-center justify-center gap-1 rounded-full bg-white/70 px-2 text-xs font-medium text-gray-700 shadow-lg">
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-out",
              collapsed ? "-rotate-90" : "rotate-0"
            )}
            aria-hidden
          />
          <span className="whitespace-nowrap text-center">
            {collapsed ? "Expand" : "Collapse"}
          </span>
        </span>
      </button>

      <div
        className={cn(
          "overflow-hidden bg-white/95 transition-[max-height,opacity] duration-250 ease-in-out",
          collapsed ? "max-h-0 opacity-0" : "max-h-[9999px] opacity-100"
        )}
      >
        <div className="px-3 pb-3 pt-1">{children}</div>
      </div>
    </div>
  );
}
