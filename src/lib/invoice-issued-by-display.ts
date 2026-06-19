/**
 * "Invoice issued" actor — session creator (`created_by_*`), not billing `user_id` / issuer.
 */

import {
  mapInvoiceRecordAuditActors,
  type EntityDetailAuditActor,
} from "@/lib/entity-detail-audit-actor";
import type { EntityRole } from "@/lib/entity-routes";

export type InvoiceIssuedBySource = Parameters<typeof mapInvoiceRecordAuditActors>[0];

/** Who issued the invoice — prefers `created_by_*`, falls back to billing owner. */
export function mapInvoiceIssuedByActor(
  invoice: InvoiceIssuedBySource
): EntityDetailAuditActor | null {
  return mapInvoiceRecordAuditActors(invoice).createdBy;
}

/** Props for `InvoiceIssuedByMeta` from invoice row audit fields. */
export function invoiceIssuedByMetaProps(
  invoice: InvoiceIssuedBySource & { created_at: string },
  viewerRole?: EntityRole
) {
  // Treating / calendar owner are separate UI rows — this is the CRUD session actor only.
  const actor = mapInvoiceIssuedByActor(invoice);
  return {
    createdAt: invoice.created_at,
    issuerLabel: actor?.label ?? null,
    issuerImage: actor?.image ?? null,
    issuerEmail: actor?.email ?? null,
    issuerUserId: actor?.userId ?? null,
    issuerRole: actor?.role ?? null,
    viewerRole,
  };
}
