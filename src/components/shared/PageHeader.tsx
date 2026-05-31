"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  pageChromeTitleStackClass,
  pageHeaderDescriptionClass,
  pageHeaderRootClass,
  pageHeaderTitleClass,
} from "@/lib/page-chrome-classes";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: string | React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  /** @deprecated Same layout as default — kept for existing call sites. */
  compact?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  loading = false,
  compact: _compact = false,
  ...props
}: PageHeaderProps) {
  if (loading) {
    return (
      <div className={cn(pageHeaderRootClass, className)} {...props}>
        <div className={pageChromeTitleStackClass}>
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        {actions ? <Skeleton className="h-10 w-32 shrink-0" /> : null}
      </div>
    );
  }

  return (
    <div className={cn(pageHeaderRootClass, className)} {...props}>
      <div className={pageChromeTitleStackClass}>
        <div role="heading" aria-level={1} className={pageHeaderTitleClass}>
          {title}
        </div>
        {description ? (
          <div className={pageHeaderDescriptionClass}>{description}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
