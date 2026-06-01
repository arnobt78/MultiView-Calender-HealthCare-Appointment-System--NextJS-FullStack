"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Receipt } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invoiceDetailHref } from "@/lib/entity-routes";
import type { Invoice } from "@/hooks/usePayments";
import { InvoiceStatusBadge } from "@/components/shared/billing/InvoiceStatusBadge";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  organizationId: string;
  organizationName: string;
};

/** Read-only org invoice list — admin filters GET /api/invoices?organizationId= */
export function OrganizationBillingPanel({ organizationId, organizationName }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.invoices.all, "org", organizationId],
    queryFn: () =>
      apiClient<{ invoices: Invoice[] }>(
        `/api/invoices?organizationId=${encodeURIComponent(organizationId)}`
      ),
    staleTime: 30_000,
  });

  const invoices = data?.invoices ?? [];

  return (
    <Card className="rounded-[28px] border bg-gradient-to-br from-violet-500/5 via-white to-white/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="h-4 w-4" />
          Billing — {organizationName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full rounded-lg" />
        ) : invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices tagged for this organization.</p>
        ) : (
          <ul className="space-y-2">
            {invoices.slice(0, 5).map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs"
              >
                <Link
                  href={invoiceDetailHref("admin", inv.id)}
                  className="min-w-0 truncate font-medium hover:underline"
                >
                  {inv.description ?? `#${inv.id.slice(0, 8)}`}
                </Link>
                <div className="flex shrink-0 items-center gap-2">
                  <InvoiceAmountDisplay amountCents={inv.amount} currency={inv.currency} />
                  <InvoiceStatusBadge invoice={inv} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
