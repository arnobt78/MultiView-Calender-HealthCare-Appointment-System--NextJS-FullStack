/** Record Audit on invoice detail — portrait + role badge (SSR first paint). */
export const invoiceAuditUserPick = {
  select: { id: true, display_name: true, email: true, image: true, role: true },
} as const;

/** Detail GET/PATCH/SSR — payments + audit actors. */
export const invoiceDetailInclude = {
  payments: { orderBy: { created_at: "desc" as const } },
  created_by: invoiceAuditUserPick,
  updated_by: invoiceAuditUserPick,
} as const;

/** Stamp on invoice create — creator and initial editor. */
export function invoiceCreateAuditFields(actorUserId: string) {
  const now = new Date();
  return {
    created_by_id: actorUserId,
    updated_by_id: actorUserId,
    updated_at: now,
  };
}

/** Stamp on human invoice mutations (PATCH, record-payment, refund). */
export function invoiceUpdateAuditFields(actorUserId: string) {
  return {
    updated_by_id: actorUserId,
    updated_at: new Date(),
  };
}

/** System events (Stripe webhook) — timestamp only, no editor. */
export function invoiceSystemUpdateAuditFields() {
  return { updated_at: new Date() };
}
