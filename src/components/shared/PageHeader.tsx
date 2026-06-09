"use client";

import * as React from "react";
import { AppPageChrome } from "@/components/shared/AppPageChrome";

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: string | React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  /** @deprecated Same layout as default — kept for existing call sites. */
  compact?: boolean;
}

/** Thin wrapper — delegates to `AppPageChrome` control-panel variant (no icon tile). */
export function PageHeader({
  title,
  description,
  actions,
  className,
  loading = false,
  compact: _compact = false,
  ...props
}: PageHeaderProps) {
  return (
    <AppPageChrome
      variant="control-panel"
      title={title}
      description={description}
      actions={actions}
      sticky
      borderBottom={false}
      loading={loading}
      className={className}
    />
  );
}
