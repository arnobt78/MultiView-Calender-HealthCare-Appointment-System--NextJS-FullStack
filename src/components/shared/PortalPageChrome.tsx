"use client";

import { AppPageChrome } from "@/components/shared/AppPageChrome";
import {
  getPortalPageChromeConfig,
  type PortalPageChromeRouteKey,
} from "@/lib/portal-page-chrome-config";

type PortalPageChromeProps = {
  route: PortalPageChromeRouteKey;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  leading?: React.ReactNode;
  titleAddon?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
};

/** Portal page chrome — reads static config; overrides for dynamic copy/actions. */
export function PortalPageChrome({
  route,
  title,
  description,
  actions,
  toolbar,
  leading,
  titleAddon,
  aside,
  className,
}: PortalPageChromeProps) {
  const config = getPortalPageChromeConfig(route);
  return (
    <AppPageChrome
      variant="portal"
      icon={config.icon}
      tone={config.tone}
      title={title ?? config.title}
      description={description ?? config.description}
      actions={actions}
      toolbar={toolbar}
      leading={leading}
      titleAddon={titleAddon}
      aside={aside}
      borderBottom
      className={className}
    />
  );
}
