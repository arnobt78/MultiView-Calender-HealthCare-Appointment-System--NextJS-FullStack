"use client";

import type { LucideIcon } from "lucide-react";
import { AppPageChrome } from "@/components/shared/AppPageChrome";

type PortalChromeHeaderProps = {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  className?: string;
};

/** Portal page chrome — delegates to `AppPageChrome` portal variant. */
export function PortalChromeHeader({
  icon,
  title,
  description,
  actions,
  toolbar,
  className,
}: PortalChromeHeaderProps) {
  return (
    <AppPageChrome
      variant="portal"
      icon={icon}
      tone="sky"
      title={title}
      description={description}
      actions={actions}
      toolbar={toolbar}
      borderBottom
      className={className}
    />
  );
}
