/**
 * CP invoice-management hub — section titles, subtitles, and status counts.
 */

import {
  countDoctorPortalInvoicesByStatus,
  doctorPortalBillingSectionTitle,
  DOCTOR_PORTAL_BILLING_SUBTITLE,
  type DoctorPortalInvoiceStatusCounts,
} from "@/lib/doctor-portal-billing-display";
import {
  ORGANIZATION_BILLING_SUBTITLE,
  organizationBillingSectionTitle,
} from "@/lib/organization-billing-display";
import type { InvoiceRow } from "@/lib/billing-types";
import type { InvoiceManagementFilterKey } from "@/lib/invoice-management-scope";

export const ALL_BILLING_SECTION_TITLE = "All Billing History";

export const ALL_BILLING_SUBTITLE =
  "All invoices in this workspace — counts by payment status. Includes invoices with no organisation tag.";

/** Shown when org scope is active — unscoped rows are excluded server-side. */
export const ORG_BILLING_SCOPE_UNSCOPED_NOTE =
  "Invoices without an organisation tag appear only in the All workspace view.";

export function organizationBillingScopeSubtitle(): string {
  return `${ORGANIZATION_BILLING_SUBTITLE} ${ORG_BILLING_SCOPE_UNSCOPED_NOTE}`;
}

export { countDoctorPortalInvoicesByStatus as countInvoicesByDisplayStatus };
export type { DoctorPortalInvoiceStatusCounts as InvoiceManagementStatusCounts };

export function invoiceManagementSectionTitle(
  filter: InvoiceManagementFilterKey,
  opts?: {
    organizationName?: string | null;
    doctorDisplayName?: string | null;
  }
): string {
  if (filter.scope === "org" && filter.orgId) {
    return organizationBillingSectionTitle(opts?.organizationName);
  }
  if (filter.scope === "doctor" && filter.doctorId) {
    return doctorPortalBillingSectionTitle(opts?.doctorDisplayName);
  }
  return ALL_BILLING_SECTION_TITLE;
}

export function invoiceManagementSectionSubtitle(
  filter: InvoiceManagementFilterKey
): string {
  if (filter.scope === "org" && filter.orgId) {
    return organizationBillingScopeSubtitle();
  }
  if (filter.scope === "doctor" && filter.doctorId) {
    return DOCTOR_PORTAL_BILLING_SUBTITLE;
  }
  return ALL_BILLING_SUBTITLE;
}

/** Count invoices tagged to an org (client-side badge on org filter options). */
export function countInvoicesForOrganization(
  invoices: ReadonlyArray<InvoiceRow>,
  organizationId: string
): number {
  return invoices.filter((inv) => inv.organization_id === organizationId).length;
}
