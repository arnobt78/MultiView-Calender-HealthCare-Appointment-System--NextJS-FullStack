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

type AuditUserPick = {
  id: string;
  display_name: string | null;
  email: string;
  image: string | null;
  role: string | null;
};

function auditActorDisplayLabel(user: AuditUserPick): string | null {
  return user.display_name?.trim() || user.email?.trim() || null;
}

/** Frozen actor when appointment hard-deleted — denormalized on linked invoices (REQ-0114). */
export function invoiceVisitDetachedByFields(user: AuditUserPick) {
  return {
    visit_detached_by_id: user.id,
    visit_detached_by_display: auditActorDisplayLabel(user),
    visit_detached_by_email: user.email?.trim() ?? null,
    visit_detached_by_image: user.image ?? null,
    visit_detached_by_role: user.role ?? null,
  };
}

/** Soft-delete tombstone actor — denormalized at DELETE (REQ-0114). */
export function invoiceSoftDeleteByFields(user: AuditUserPick, deletedAt = new Date()) {
  return {
    deleted_at: deletedAt,
    ...invoiceSoftDeleteActorFields(user),
  };
}

/** Actor columns only — for tests or partial updates. */
export function invoiceSoftDeleteActorFields(user: AuditUserPick) {
  return {
    deleted_by_id: user.id,
    deleted_by_display: auditActorDisplayLabel(user),
    deleted_by_email: user.email?.trim() ?? null,
    deleted_by_image: user.image ?? null,
    deleted_by_role: user.role ?? null,
  };
}

/** Load actor for snapshot / soft-delete writes. */
export async function loadInvoiceAuditActorUser(userId: string) {
  const { prisma } = await import("@/lib/prisma");
  return prisma.user.findUnique({
    where: { id: userId },
    select: invoiceAuditUserPick.select,
  });
}
