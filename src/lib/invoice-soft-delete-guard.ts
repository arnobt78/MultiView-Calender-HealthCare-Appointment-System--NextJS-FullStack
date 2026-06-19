/**
 * Soft-delete tombstone guards — block mutations on deleted invoice rows (REQ-0114).
 */

export function isPrismaInvoiceSoftDeleted(invoice: {
  deleted_at?: Date | string | null;
}): boolean {
  if (invoice.deleted_at == null) return false;
  if (invoice.deleted_at instanceof Date) return !Number.isNaN(invoice.deleted_at.getTime());
  return Boolean(String(invoice.deleted_at).trim());
}

export const INVOICE_SOFT_DELETED_ERROR = "Invoice has been deleted";
