"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Receipt } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Invoice } from "@/hooks/usePayments";
import { InvoiceBillingStatsRow } from "@/components/shared/billing/InvoiceBillingStatsRow";
import { InvoiceBillingListRow } from "@/components/shared/billing/InvoiceBillingListRow";
import { PortalPanelCountBadge } from "@/components/shared/PortalPanelCountBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { InvoiceBillingTotals } from "@/lib/invoice-billing-totals";

type Props = {
  organizationId: string;
  organizationName: string;
};

/** Read-only org invoice list — admin filters GET /api/invoices?organizationId= */
export function OrganizationBillingPanel({ organizationId, organizationName }: Props) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  const orgBillingQueryKey = queryKeys.invoices.byOrganization(organizationId);

  const { data, isLoading } = useQuery({
    queryKey: orgBillingQueryKey,
    queryFn: () =>
      apiClient<{ invoices: Invoice[] }>(
        `/api/invoices?organizationId=${encodeURIComponent(organizationId)}`
      ),
    staleTime: 30_000,
  });
  const { data: totalsData, isLoading: isTotalsLoading } = useQuery({
    queryKey: queryKeys.invoices.byOrganizationTotals(organizationId),
    queryFn: () =>
      apiClient<{ totals: InvoiceBillingTotals }>(
        `/api/invoices/billing-totals?organizationId=${encodeURIComponent(organizationId)}`
      ),
    staleTime: 30_000,
  });

  const invoices = data?.invoices ?? [];
  const totals = totalsData?.totals;
  const loading = !isMounted || isLoading;
  const statsLoading = !isMounted || isTotalsLoading;

  return (
    <Card className="rounded-[28px] border bg-linear-to-br from-violet-500/5 via-white to-white/95 backdrop-blur-sm shadow-[0_24px_60px_rgba(139,92,246,0.1)]">
      <CardHeader className="space-y-3 pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          <Receipt className="h-4 w-4 shrink-0 text-violet-600" />
          <span>Billing — {organizationName}</span>
          {!loading ? (
            <PortalPanelCountBadge>
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            </PortalPanelCountBadge>
          ) : (
            <Skeleton className="h-5 w-20 rounded-full" />
          )}
        </CardTitle>
        <InvoiceBillingStatsRow
          invoices={invoices}
          totals={totals}
          valueSkeleton={statsLoading}
        />
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {loading ? (
          <ul className="space-y-2" aria-hidden>
            {Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-3"
              >
                <Skeleton className="h-4 w-full max-w-md rounded" />
                <Skeleton className="mt-2 h-3 w-full max-w-sm rounded" />
                <div className="mt-2 flex justify-end gap-2">
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </li>
            ))}
          </ul>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No invoices tagged for this organization.
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {invoices.map((inv) => (
                <InvoiceBillingListRow key={inv.id} invoice={inv} viewerRole="admin" />
              ))}
            </ul>
            <p className={cn("border-t pt-2 text-xs text-muted-foreground")}>
              {invoices.length} of {invoices.length} invoices
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
