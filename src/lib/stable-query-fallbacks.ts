/**
 * Stable empty collections for TanStack Query hook fallbacks.
 * `query.data ?? []` allocates a new array every render and breaks useEffect/useCallback deps.
 */
import type { InvoiceRow } from "@/lib/billing-types";
import type { OrganizationListRow } from "@/lib/organization-list-enrich";
import type { OrganizationDetailMemberRow } from "@/lib/organization-detail-members-columns";
import type { Category, Patient } from "@/types/types";

export const EMPTY_PATIENTS: Patient[] = [];
export const EMPTY_CATEGORIES: Category[] = [];
export const EMPTY_ORGANIZATIONS: OrganizationListRow[] = [];
export const EMPTY_ORG_MEMBERS: OrganizationDetailMemberRow[] = [];
export const EMPTY_INVOICES: InvoiceRow[] = [];
