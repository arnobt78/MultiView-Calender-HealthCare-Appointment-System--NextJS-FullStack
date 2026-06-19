/**
 * Shared billing UI presets — glass create trigger + list-row menu icon (CP patient table parity).
 */

import type { LucideIcon } from "lucide-react";
import { FileEdit, Plus } from "lucide-react";
import { emeraldGlassPrimaryButtonClass } from "@/lib/calendar-header-action-styles";
import { toTitleCaseLabel } from "@/lib/utils";

/** List/table invoice rows use vertical ⋮ (matches `PatientManagement` actions column). */
export const INVOICE_LIST_ACTIONS_MENU_ICON = "vertical" as const;

/** Ghost icon trigger — same footprint as CP patient row menus. */
export const invoiceActionsMenuTriggerClassName = "h-7 w-7";

export type BillingCreateInvoiceTriggerPreset = {
  triggerLabel: string;
  triggerClassName: string;
  triggerIcon: LucideIcon;
};

/** Control panel `InvoiceManagement` + admin surfaces. */
export const billingCreateInvoiceTriggerAdmin: BillingCreateInvoiceTriggerPreset = {
  triggerLabel: toTitleCaseLabel("Create Invoice"),
  triggerClassName: emeraldGlassPrimaryButtonClass,
  triggerIcon: FileEdit,
};

/** Doctor portal billing card — emerald glass, explicit draft copy. */
export const billingCreateInvoiceTriggerDoctor: BillingCreateInvoiceTriggerPreset = {
  triggerLabel: toTitleCaseLabel("Create Draft"),
  triggerClassName: emeraldGlassPrimaryButtonClass,
  triggerIcon: FileEdit,
};

/** Compact default when no glass preset is passed (legacy call sites). */
export const billingCreateInvoiceTriggerDefault: BillingCreateInvoiceTriggerPreset = {
  triggerLabel: "Create Invoice",
  triggerClassName: "",
  triggerIcon: Plus,
};
