"use client";

import type { ReactNode } from "react";
import {
  appEntityDetailBodyStackClass,
  resolveEntityDetailRootClass,
  type AppSectionScrollShell,
} from "@/lib/section-page-layout";

type EntityDetailPageShellProps = {
  /** CP right pane vs portal document scroll — picks root padding contract. */
  shell?: AppSectionScrollShell;
  /** Sticky entity chrome — rendered outside body stack so no space-y gap under header. */
  header: ReactNode;
  children: ReactNode;
};

/**
 * Entity detail layout shell — header flush to first body block (REQ-0061).
 * Body siblings (banner, glass card, footer) keep `space-y-3` rhythm.
 */
export function EntityDetailPageShell({
  shell = "control-panel",
  header,
  children,
}: EntityDetailPageShellProps) {
  return (
    <div className={resolveEntityDetailRootClass(shell)}>
      {header}
      <div className={appEntityDetailBodyStackClass}>{children}</div>
    </div>
  );
}
