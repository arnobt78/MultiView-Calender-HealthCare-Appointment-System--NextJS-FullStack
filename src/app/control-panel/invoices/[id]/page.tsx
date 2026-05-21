/**
 * SSR: Invoice detail page — all schema properties + payment history.
 * Server-fetches invoice + payments, displays full schema.
 */
import { notFound } from "next/navigation";
import Link from "next/link";
import { BackNavigationLink } from "@/components/shared/BackNavigationLink";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { serializeInvoice } from "@/lib/serializers";
import { isValidUUID } from "@/lib/validation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Receipt, CreditCard } from "lucide-react";

type PageProps = { params: Promise<{ id: string }> };

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-yellow-100 text-yellow-700",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  succeeded: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-orange-100 text-orange-700",
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Invoice — ${id.slice(0, 8)}` };
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!isValidUUID(id)) notFound();

  const sessionUser = await getSessionUser();
  if (!sessionUser) notFound();

  const raw = await prisma.invoice.findUnique({
    where: { id, user_id: sessionUser.userId },
    include: { payments: { orderBy: { created_at: "desc" } } },
  });
  if (!raw) notFound();

  const invoice = serializeInvoice(raw);
  const payments = raw.payments;

  const amountFormatted = (invoice.amount / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: invoice.currency.toUpperCase(),
  });

  return (
    <div className="space-y-2">
      <PageHeader
        title={`Invoice #${invoice.id.slice(0, 8)}`}
        description={invoice.description ?? "No description"}
        actions={
          <Button variant="outline" asChild>
            <BackNavigationLink href="/control-panel">
              <ArrowLeft className="h-4 w-4" />
              Back
            </BackNavigationLink>
          </Button>
        }
      />

      {/* Schema fields */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Schema: invoices
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            id · created_at · appointment_id · user_id · amount · currency · status · due_date · paid_at · description
          </p>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-muted-foreground">id</dt>
              <dd className="font-mono break-all text-xs ">{invoice.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">created_at</dt>
              <dd className="">{new Date(invoice.created_at).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">amount</dt>
              <dd className=" font-semibold text-lg">{amountFormatted}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">status</dt>
              <dd className="">
                <Badge className={STATUS_COLORS[invoice.status] ?? "bg-gray-100 text-gray-700"}>
                  {invoice.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">currency</dt>
              <dd className=" uppercase font-mono">{invoice.currency}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">due_date</dt>
              <dd className="">{invoice.due_date ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">paid_at</dt>
              <dd className="">
                {invoice.paid_at ? new Date(invoice.paid_at).toLocaleString() : "—"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">description</dt>
              <dd className="">{invoice.description ?? "—"}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">user_id</dt>
              <dd className=" font-mono text-xs break-all">{invoice.user_id}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">appointment_id</dt>
              <dd className="">
                {invoice.appointment_id ? (
                  <Link
                    href={`/control-panel/appointments/${invoice.appointment_id}`}
                    className="font-mono text-xs text-gray-700 hover:underline"
                  >
                    #{invoice.appointment_id.slice(0, 8)}
                  </Link>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History ({payments.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Schema: payments — id · created_at · invoice_id · stripe_payment_id · amount · status
          </p>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
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
                      {(p.amount / 100).toLocaleString("de-DE", {
                        style: "currency",
                        currency: invoice.currency.toUpperCase(),
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className={PAYMENT_STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-700"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.stripe_payment_id ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
