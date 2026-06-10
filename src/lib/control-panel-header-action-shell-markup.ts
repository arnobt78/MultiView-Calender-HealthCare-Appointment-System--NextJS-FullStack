/**
 * Shared decorative header action shell classes — SSR + client must match for zero-flash.
 */

import type { ControlPanelHeaderActionShellConfig } from "@/lib/control-panel-header-actions-config";
import { cn } from "@/lib/utils";

export const CP_HEADER_ACTION_SHELL_ROW_CLASS =
  "flex shrink-0 flex-wrap items-center justify-end gap-2 self-center";

export const CP_HEADER_ACTION_SHELL_BUTTON_CLASS =
  "inline-flex h-10 cursor-default items-center gap-2 px-4 text-sm font-medium opacity-90 pointer-events-none select-none";

export function getOrderedHeaderActionShells(
  shells: ControlPanelHeaderActionShellConfig[]
): ControlPanelHeaderActionShellConfig[] {
  const secondary = shells.filter((s) => s.variant === "secondary");
  const primary = shells.filter((s) => s.variant !== "secondary");
  return [...secondary, ...primary];
}

export function getHeaderActionShellButtonClassName(
  shell: ControlPanelHeaderActionShellConfig
): string {
  return cn(shell.className, CP_HEADER_ACTION_SHELL_BUTTON_CLASS);
}
