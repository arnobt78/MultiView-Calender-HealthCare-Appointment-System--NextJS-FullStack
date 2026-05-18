"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PortalChromeHeaderProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Right slot — e.g. Book Appointment on patient portal */
  actions?: React.ReactNode;
  className?: string;
};

/**
 * Page chrome for `/services` and `/patient-portal` — tall icon column spans title + subtitle, then `border-b`.
 * Static shell always mounts; only inner page data slots pulse elsewhere.
 */
export function PortalChromeHeader({
  icon: Icon,
  title,
  description,
  actions,
  className,
}: PortalChromeHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b pb-4 md:flex-row md:items-stretch md:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-stretch gap-2">
        <span className="flex w-12 shrink-0 items-center justify-center self-stretch min-h-[3.5rem] rounded-xl border border-sky-200 bg-sky-100">
          <Icon className="h-6 w-6 text-sky-600" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-col justify-center">
          <h1 className="text-xl font-semibold tracking-tight text-gray-700 md:text-2xl">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center">{actions}</div> : null}
    </div>
  );
}
