"use client";

import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import {
  getControlPanelHeaderActionShells,
  resolveHeaderActionIcon,
} from "@/lib/control-panel-header-actions-config";
import {
  CP_HEADER_ACTION_SHELL_ROW_CLASS,
  getHeaderActionShellButtonClassName,
  getOrderedHeaderActionShells,
} from "@/lib/control-panel-header-action-shell-markup";

type Props = {
  tab: ControlPanelSidebarTabValue;
  /** When true, live interactive buttons replaced shells — hide decorative copies. */
  hidden?: boolean;
};

/** Client fallback shells when no SSR actions node was passed (legacy routes). */
export function ControlPanelChromeActionsShell({ tab, hidden }: Props) {
  if (hidden) return null;
  const shells = getOrderedHeaderActionShells(
    getControlPanelHeaderActionShells(tab, "actions")
  );
  if (!shells.length) return null;

  return (
    <div className={CP_HEADER_ACTION_SHELL_ROW_CLASS} aria-hidden="true">
      {shells.map((shell) => {
        const Icon = resolveHeaderActionIcon(shell.iconKey);
        return (
          <span key={shell.label} className={getHeaderActionShellButtonClassName(shell)}>
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {shell.label}
          </span>
        );
      })}
    </div>
  );
}
