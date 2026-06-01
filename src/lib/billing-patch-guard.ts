/**
 * PATCH guards — paid status must go through record-payment or Stripe webhook (Payment row required).
 */

export function rejectPatchStatusPaid(
  nextStatus: string | undefined
): { ok: true } | { ok: false; message: string } {
  if (nextStatus === "paid") {
    return {
      ok: false,
      message:
        "Use POST /api/invoices/[id]/record-payment or Stripe checkout to mark an invoice paid.",
    };
  }
  return { ok: true };
}
