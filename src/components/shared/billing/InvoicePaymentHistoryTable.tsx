"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceAmountDisplay } from "@/components/shared/billing/InvoiceAmountDisplay";
import type { InvoicePaymentRow } from "@/lib/billing-types";

const PAYMENT_STATUS_CLASS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  succeeded: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-orange-100 text-orange-700",
};

type Props = {
  payments: InvoicePaymentRow[];
  currency: string;
};

export function InvoicePaymentHistoryTable({ payments, currency }: Props) {
  if (payments.length === 0) {
    return <p className="text-sm text-muted-foreground">No payments recorded yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Payment ID</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Stripe ID</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-mono text-xs">#{p.id.slice(0, 8)}</TableCell>
            <TableCell className="font-semibold">
              <InvoiceAmountDisplay amountCents={p.amount} currency={currency} />
            </TableCell>
            <TableCell>
              <Badge className={PAYMENT_STATUS_CLASS[p.status] ?? "bg-gray-100 text-gray-700"}>
                {p.status}
              </Badge>
            </TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {p.stripe_payment_id ?? "—"}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {format(new Date(p.created_at), "dd MMM yyyy")}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
