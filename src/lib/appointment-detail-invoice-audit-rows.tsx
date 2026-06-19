/**
 * Record audit extra rows for appointment detail — one block per linked invoice.
 */
"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { CalendarClock, CreditCard, Receipt, Trash2, UserRound } from "lucide-react";
import { format } from "date-fns";
import type { Invoice } from "@/hooks/usePayments";
import { invoiceDueDateTextClassForInvoice } from "@/lib/invoice-status-display";
import { ClinicalEmptyDash } from "@/components/shared/ClinicalTableEmptyDash";
import { EntityDetailAuditActorInline } from "@/components/shared/entity-detail/EntityDetailAuditActorInline";
import type { EntityDetailAuditActor } from "@/lib/entity-detail-audit-actor";
import { mapInvoiceRecordAuditActors, listInvoiceDeletionMetaSlices } from "@/lib/entity-detail-audit-actor";
import { InvoiceDeletionActorMeta } from "@/components/shared/billing/InvoiceDeletionActorMeta";
import type { EntityRole } from "@/lib/entity-routes";
import { cn } from "@/lib/utils";

export type EntityDetailAuditExtraRow = {
  icon: LucideIcon;
  label?: string;
  children: ReactNode;
};

/** Invoice billing owner — avatar, email, role (invoice detail "Issued by" row). */
export function mapInvoiceIssuerActor(invoice: Invoice): EntityDetailAuditActor | null {
  const label = invoice.issuer_label?.trim();
  if (!invoice.user_id || !label) return null;
  return {
    userId: invoice.user_id,
    label,
    email: invoice.issuer_email,
    image: invoice.issuer_image,
    role: invoice.issuer_role,
  };
}

/** Invoice create actor — session user who issued the draft (appointment detail "Invoice issued" row). */
export function mapInvoiceCreatedByActor(invoice: Invoice): EntityDetailAuditActor | null {
  return mapInvoiceRecordAuditActors(invoice).createdBy;
}

/** Issued row — same layout as Created/Last Updated (`Label: time · actor`). */
function InvoiceRecordAuditIssuedContent({
  createdAt,
  actor,
  viewerRole,
}: {
  createdAt: string;
  actor: EntityDetailAuditActor | null;
  viewerRole?: EntityRole | null;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
      {createdAt ? (
        format(new Date(createdAt), "M/d/yyyy, h:mm:ss a")
      ) : (
        <ClinicalEmptyDash layout="inline" />
      )}
      {actor ? (
        <>
          <span className="text-gray-500" aria-hidden>
            ·
          </span>
          <EntityDetailAuditActorInline actor={actor} viewerRole={viewerRole} />
        </>
      ) : null}
    </div>
  );
}

/** Build invoice issued / due / paid rows for `EntityDetailRecordAuditCard.extraRows`. */
export function buildAppointmentInvoiceAuditExtraRows(
  invoices: Invoice[],
  viewerRole?: EntityRole | null
): EntityDetailAuditExtraRow[] {
  const rows: EntityDetailAuditExtraRow[] = [];
  for (const invoice of invoices) {
    const suffix =
      invoices.length > 1 ? ` (#${invoice.id.slice(0, 8)})` : "";
    rows.push({
      icon: Receipt,
      label: `Invoice issued${suffix}`,
      children: (
        <InvoiceRecordAuditIssuedContent
          createdAt={invoice.created_at}
          actor={mapInvoiceCreatedByActor(invoice)}
          viewerRole={viewerRole}
        />
      ),
    });
    rows.push({
      icon: CalendarClock,
      label: `Due date${suffix}`,
      children: invoice.due_date ? (
        <span
          className={cn(
            "text-xs tabular-nums",
            invoiceDueDateTextClassForInvoice(invoice)
          )}
        >
          {format(new Date(invoice.due_date), "PPP · p")}
        </span>
      ) : (
        <ClinicalEmptyDash layout="inline" />
      ),
    });
    if (invoice.paid_at) {
      rows.push({
        icon: CreditCard,
        label: `Paid at${suffix}`,
        children: (
          <span className="text-xs tabular-nums text-emerald-700">
            {format(new Date(invoice.paid_at), "PPP · p")}
          </span>
        ),
      });
    }
  }
  return rows;
}

/** Invoice detail — issued by (billing owner), due, paid. Created/Last updated use audit FKs. */
export function buildInvoiceDetailAuditExtraRows(
  invoice: Invoice,
  viewerRole?: EntityRole | null
): EntityDetailAuditExtraRow[] {
  const issuer = mapInvoiceIssuerActor(invoice);
  const rows: EntityDetailAuditExtraRow[] = [];

  for (const slice of listInvoiceDeletionMetaSlices(invoice)) {
    rows.push({
      icon: slice.kind === "visit" ? CalendarClock : Trash2,
      label: slice.kind === "visit" ? "Visit deleted" : "Invoice deleted",
      children: (
        <InvoiceDeletionActorMeta
          kind={slice.kind}
          at={slice.at}
          actor={slice.actor}
          viewerRole={viewerRole ?? undefined}
          layout="wrapInline"
        />
      ),
    });
  }

  if (issuer) {
    rows.push({
      icon: UserRound,
      label: "Issued by",
      children: (
        <EntityDetailAuditActorInline actor={issuer} viewerRole={viewerRole} />
      ),
    });
  }

  rows.push({
      icon: CalendarClock,
      label: "Due date",
      children: invoice.due_date ? (
        <span
          className={cn(
            "text-xs tabular-nums",
            invoiceDueDateTextClassForInvoice(invoice)
          )}
        >
          {format(new Date(invoice.due_date), "PPP · p")}
        </span>
      ) : (
        <ClinicalEmptyDash layout="inline" />
      ),
    });

  if (invoice.paid_at) {
    rows.push({
      icon: CreditCard,
      label: "Paid at",
      children: (
        <span className="text-xs tabular-nums text-emerald-700">
          {format(new Date(invoice.paid_at), "PPP · p")}
        </span>
      ),
    });
  }
  return rows;
}
