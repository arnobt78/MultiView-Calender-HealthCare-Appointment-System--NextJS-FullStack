"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string | React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  /** Entity detail pages — tighter title/description stack, no extra vertical padding. */
  compact?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  loading = false,
  compact = false,
  ...props
}: PageHeaderProps) {
  if (loading) {
    return (
      <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", className)} {...props}>
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div>
          {actions && <Skeleton className="h-10 w-32" />}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 backdrop-blur-sm z-20",
        compact ? "gap-2" : "gap-4",
        className
      )}
      {...props}
    >
      <div className={cn("min-w-0 flex-1", compact ? "py-0" : "py-2")}>
        <div
          role="heading"
          aria-level={1}
          className={cn(
            "font-semibold tracking-tight text-gray-700",
            compact ? "text-xl leading-tight" : "text-xl"
          )}
        >
          {title}
        </div>
        {description ? (
          <div
            className={cn(
              "text-gray-500 text-xs sm:text-sm",
              compact ? "mt-0.5 leading-snug" : undefined
            )}
          >
            {description}
          </div>
        ) : null}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
