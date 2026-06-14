/**
 * Static header action metadata per CP tab — serializable for SSR + client shells.
 */

import type { LucideIcon } from "lucide-react";
import {
  Download,
  FileEdit,
  Plus,
  RefreshCw,
  Tag,
  UserPlus,
  CheckCheck,
  Building2,
} from "lucide-react";
import type { ControlPanelSidebarTabValue } from "@/lib/control-panel-nav-config";
import {
  emeraldGlassPrimaryButtonClass,
  skyGlassBackButtonClass,
  skyGlassResetButtonClass,
  violetGlassImportButtonClass,
  violetGlassPrimaryButtonClass,
} from "@/lib/calendar-header-action-styles";
import { toTitleCaseLabel } from "@/lib/utils";

export type ControlPanelHeaderActionIconKey =
  | "download"
  | "fileEdit"
  | "plus"
  | "refresh"
  | "tag"
  | "userPlus"
  | "checkCheck"
  | "building2";

export type ControlPanelHeaderActionSlot = "actions" | "toolbar";

export type ControlPanelHeaderActionShellConfig = {
  label: string;
  iconKey: ControlPanelHeaderActionIconKey;
  className: string;
  slot: ControlPanelHeaderActionSlot;
  /** Secondary actions (e.g. Export CSV) render before primary. */
  variant?: "primary" | "secondary";
};

/** @deprecated Client-only — use ControlPanelHeaderActionShellConfig + resolveHeaderActionIcon. */
export type ControlPanelHeaderActionShell = ControlPanelHeaderActionShellConfig & {
  icon: LucideIcon;
};

const ICON_MAP: Record<ControlPanelHeaderActionIconKey, LucideIcon> = {
  download: Download,
  fileEdit: FileEdit,
  plus: Plus,
  refresh: RefreshCw,
  tag: Tag,
  userPlus: UserPlus,
  checkCheck: CheckCheck,
  building2: Building2,
};

export function resolveHeaderActionIcon(
  iconKey: ControlPanelHeaderActionIconKey
): LucideIcon {
  return ICON_MAP[iconKey];
}

const PATIENT_ACTIONS: ControlPanelHeaderActionShellConfig[] = [
  {
    label: "Export CSV",
    iconKey: "download",
    className: violetGlassImportButtonClass,
    slot: "actions",
    variant: "secondary",
  },
  {
    label: toTitleCaseLabel("Add Patient"),
    iconKey: "userPlus",
    className: emeraldGlassPrimaryButtonClass,
    slot: "actions",
    variant: "primary",
  },
];

const TAB_HEADER_ACTION_SHELLS: Partial<
  Record<ControlPanelSidebarTabValue, ControlPanelHeaderActionShellConfig[]>
> = {
  overview: [
    {
      label: toTitleCaseLabel("Refresh"),
      iconKey: "refresh",
      className: skyGlassBackButtonClass,
      slot: "actions",
    },
  ],
  patients: PATIENT_ACTIONS,
  categories: [
    {
      label: toTitleCaseLabel("Add Category"),
      iconKey: "tag",
      className: violetGlassPrimaryButtonClass,
      slot: "actions",
    },
  ],
  doctors: [
    {
      label: toTitleCaseLabel("Add Doctor"),
      iconKey: "userPlus",
      className: emeraldGlassPrimaryButtonClass,
      slot: "actions",
    },
  ],
  users_admin: [
    {
      label: toTitleCaseLabel("Add Admin"),
      iconKey: "userPlus",
      className: emeraldGlassPrimaryButtonClass,
      slot: "actions",
    },
  ],
  invoices: [
    {
      label: toTitleCaseLabel("Create Invoice"),
      iconKey: "fileEdit",
      className: emeraldGlassPrimaryButtonClass,
      slot: "actions",
    },
  ],
  visit_types_global: [
    {
      label: toTitleCaseLabel("Add Global Type"),
      iconKey: "plus",
      className: emeraldGlassPrimaryButtonClass,
      slot: "actions",
    },
  ],
  organizations: [
    {
      label: toTitleCaseLabel("Create Organization"),
      iconKey: "building2",
      className: emeraldGlassPrimaryButtonClass,
      slot: "actions",
    },
  ],
  appointments_mgmt: [
    {
      label: "Export CSV",
      iconKey: "download",
      className: violetGlassImportButtonClass,
      slot: "actions",
      variant: "secondary",
    },
    {
      label: toTitleCaseLabel("New Appointment"),
      iconKey: "plus",
      className: emeraldGlassPrimaryButtonClass,
      slot: "actions",
      variant: "primary",
    },
  ],
  notifications: [
    {
      label: "Export CSV",
      iconKey: "download",
      className: violetGlassImportButtonClass,
      slot: "actions",
      variant: "secondary",
    },
    {
      label: toTitleCaseLabel("Refresh"),
      iconKey: "refresh",
      className: skyGlassBackButtonClass,
      slot: "actions",
      variant: "secondary",
    },
    {
      label: toTitleCaseLabel("Mark All Read"),
      iconKey: "checkCheck",
      className: skyGlassResetButtonClass,
      slot: "actions",
      variant: "secondary",
    },
    {
      label: toTitleCaseLabel("New Appointment"),
      iconKey: "plus",
      className: emeraldGlassPrimaryButtonClass,
      slot: "actions",
      variant: "primary",
    },
  ],
  "google-calendar": [
    {
      label: toTitleCaseLabel("Refresh"),
      iconKey: "refresh",
      className: skyGlassBackButtonClass,
      slot: "actions",
      variant: "secondary",
    },
    {
      label: "Export ICS",
      iconKey: "download",
      className: violetGlassImportButtonClass,
      slot: "actions",
      variant: "secondary",
    },
  ],
};

export function getControlPanelHeaderActionShells(
  tab: ControlPanelSidebarTabValue,
  slot?: ControlPanelHeaderActionSlot
): ControlPanelHeaderActionShellConfig[] {
  const all = TAB_HEADER_ACTION_SHELLS[tab] ?? [];
  if (slot == null) return all;
  return all.filter((s) => s.slot === slot);
}
