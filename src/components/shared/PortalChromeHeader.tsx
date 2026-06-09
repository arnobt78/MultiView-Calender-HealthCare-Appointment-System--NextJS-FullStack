"use client";

import type { LucideIcon } from "lucide-react";
import { AppPageChrome } from "@/components/shared/AppPageChrome";
import type { PageChromeTone } from "@/lib/page-chrome-classes";

type PortalChromeHeaderProps = {
  icon: LucideIcon;
  title: string;
  description: React.ReactNode;
  tone?: PageChromeTone;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  className?: string;
};

/** @deprecated Prefer `PortalPageChrome` with `portal-page-chrome-config` route keys. */
export function PortalChromeHeader({
  icon,
  title,
  description,
  tone = "sky",
  actions,
  toolbar,
  className,
}: PortalChromeHeaderProps) {
  return (
    <AppPageChrome
      variant="portal"
      icon={icon}
      tone={tone}
      title={title}
      description={description}
      actions={actions}
      toolbar={toolbar}
      borderBottom
      className={className}
    />
  );
}
