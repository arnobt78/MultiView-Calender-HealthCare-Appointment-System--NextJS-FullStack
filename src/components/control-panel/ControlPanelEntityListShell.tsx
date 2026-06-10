"use client";

/**
 * Static layout chrome for CP entity list tabs (classes only — no data hooks).
 * Parent seeds SSR cache; slots hold interactive filters, stats values, and DataTable.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { controlPanelSectionRootClass } from "@/lib/control-panel-section-layout";
import {
  cpEntityListStatsStripClass,
  cpEntityListTableFrameClass,
  type CpEntityListTone,
} from "@/lib/cp-entity-list-shell-classes";

export type ControlPanelEntityListShellProps = {
  tone: CpEntityListTone;
  /** Page chrome actions row (client ControlPanelPageChrome). */
  headerSlot?: ReactNode;
  /** Demo / feature notes below header. */
  bannerSlot?: ReactNode;
  /** KPI / stat cards (client values). */
  statsSlot?: ReactNode;
  /** Sticky filter toolbar (client). */
  toolbarSlot?: ReactNode;
  /** DataTable or list body (client). */
  tableSlot: ReactNode;
  /** Dialogs, pagination stubs, demo notes below table. */
  footerSlot?: ReactNode;
  /** When false, shell only wraps tableSlot (doctor-portal embed). */
  fullSection?: boolean;
};

export function ControlPanelEntityListShell({
  tone,
  headerSlot,
  bannerSlot,
  statsSlot,
  toolbarSlot,
  tableSlot,
  footerSlot,
  fullSection = true,
}: ControlPanelEntityListShellProps) {
  const tableFrame = cpEntityListTableFrameClass[tone];

  const body = (
    <>
      {headerSlot}
      {bannerSlot}
      {statsSlot != null ? (
        <div className={cpEntityListStatsStripClass}>{statsSlot}</div>
      ) : null}
      {toolbarSlot}
      <div className={cn("overflow-hidden", tableFrame)}>{tableSlot}</div>
      {footerSlot}
    </>
  );

  if (!fullSection) {
    return <>{body}</>;
  }

  return (
    <div className={cn(controlPanelSectionRootClass, "overflow-visible")}>{body}</div>
  );
}
