"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string | React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  loading = false,
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
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 backdrop-blur-sm z-20",
        className
      )}
      {...props}
    >
      <div className="min-w-0 flex-1 py-2">
        {/* `title` / `description` may be block nodes (e.g. Skeleton) — avoid <h1>/<p> so HTML stays valid and hydration matches. */}
        <div
          role="heading"
          aria-level={1}
          className="text-xl font-semibold tracking-tight text-gray-700"
        >
          {title}
        </div>
        {description ? (
          <div className="text-gray-500 text-xs sm:text-sm">{description}</div>
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
