"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AppPageChrome } from "@/components/shared/AppPageChrome";
import {
  entityDetailChromeSkyIconClass,
  entityDetailChromeSkyIconTileClass,
} from "@/lib/page-chrome-classes";

type EntityDetailChromeHeaderProps = {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  iconTileClassName?: string;
  iconClassName?: string;
  className?: string;
};

/** Entity detail chrome — delegates to `AppPageChrome` entity-detail variant. */
export function EntityDetailChromeHeader({
  icon,
  title,
  description,
  actions,
  iconTileClassName = entityDetailChromeSkyIconTileClass,
  iconClassName = entityDetailChromeSkyIconClass,
  className,
}: EntityDetailChromeHeaderProps) {
  return (
    <AppPageChrome
      variant="entity-detail"
      icon={icon}
      iconTileClassName={iconTileClassName}
      iconClassName={iconClassName}
      title={title}
      description={description}
      actions={actions}
      borderBottom={false}
      className={className}
    />
  );
}
