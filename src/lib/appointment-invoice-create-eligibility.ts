/**
 * Client-side gate for "Create invoice" on appointment surfaces — no extra API call.
 */

import { isAdminRole, isDoctorRole } from "@/lib/rbac";
import {
  isBlockingInvoiceStatus,
  type InvoiceDisplayStatus,
} from "@/lib/billing-appointment-eligibility";

export type CanShowCreateInvoiceActionInput = {
  role: string | null | undefined;
  /** From useAppointmentInvoiceDisplayMap — undefined means no invoice yet. */
  invoiceDisplayStatus?: InvoiceDisplayStatus | null;
};

/** Staff with no blocking invoice on this visit may open preset create dialog. */
export function canShowCreateInvoiceAction(input: CanShowCreateInvoiceActionInput): boolean {
  const { role, invoiceDisplayStatus } = input;
  if (!isAdminRole(role) && !isDoctorRole(role)) return false;
  if (invoiceDisplayStatus == null) return true;
  return !isBlockingInvoiceStatus(invoiceDisplayStatus);
}
