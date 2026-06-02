/**
 * SSR prefetch for per-organization billing lists (CP Organization Management panels).
 * Cache key: `queryKeys.invoices.byOrganization(orgId)` — busted via `invalidateInvoices*`.
 */

import type { Invoice } from "@/hooks/usePayments";
import {
  emptyInvoiceBillingStatusTotals,
  type InvoiceBillingTotals,
  type InvoiceBillingTotalsPayload,
} from "@/lib/invoice-billing-totals";
import {
  prefetchInvoiceBillingTotalsForOrganization,
  prefetchInvoicesForOrganization,
} from "@/lib/server-prefetch";

/** Max org billing lists prefetched on one CP tab navigation (safety cap). */
export const ORG_BILLING_PREFETCH_ORG_CAP = 20;

const EMPTY_TOTALS: InvoiceBillingTotals = {
  paid: { cents: 0, count: 0 },
  outstanding: { cents: 0, count: 0 },
  refunded: { cents: 0, count: 0 },
  cancelled: { cents: 0, count: 0 },
};

export type OrgBillingCachePayload = {
  invoices: Invoice[];
  totals: InvoiceBillingTotals;
  statusTotals: InvoiceBillingTotalsPayload["statusTotals"];
};

/**
 * Parallel SSR seed for every org on the organizations tab (not only the first row).
 */
export async function prefetchOrgBillingInvoicesByOrgIds(
  organizationIds: string[],
  userId: string,
  role: string | null,
  email: string
): Promise<Record<string, OrgBillingCachePayload>> {
  const unique = [...new Set(organizationIds)].slice(0, ORG_BILLING_PREFETCH_ORG_CAP);
  if (unique.length === 0) return {};

  const pairs = await Promise.all(
    unique.map(async (orgId) => {
      const [invoices, billingPayload] = await Promise.all([
        prefetchInvoicesForOrganization(orgId, userId, role, email),
        prefetchInvoiceBillingTotalsForOrganization(orgId),
      ]);
      const payload: OrgBillingCachePayload = {
        invoices: invoices ?? [],
        totals: billingPayload?.totals ?? EMPTY_TOTALS,
        statusTotals:
          billingPayload?.statusTotals ?? emptyInvoiceBillingStatusTotals(),
      };
      return [orgId, payload] as const;
    })
  );

  const map: Record<string, OrgBillingCachePayload> = {};
  for (const [orgId, payload] of pairs) {
    map[orgId] = payload;
  }
  return map;
}
