/**
 * Tracks open Stripe Checkout session per invoice — expire previous tab/session on new Pay Now.
 */

import { redis } from "@/lib/redis";
import { STRIPE_CHECKOUT_EXPIRES_SEC } from "@/lib/stripe";

function stripeSecretKey(): string {
  return process.env.STRIPE_SECRET_KEY || "";
}

function checkoutSessionRedisKey(invoiceId: string): string {
  return `stripe:checkout:invoice:${invoiceId}`;
}

/** Best-effort expire — ignores already-expired/complete sessions. */
export async function expireStripeCheckoutSession(sessionId: string): Promise<void> {
  const secret = stripeSecretKey();
  if (!secret || !sessionId.trim()) return;

  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}/expire`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    if (/already expired|complete|no longer active/i.test(err)) return;
    console.warn("Stripe checkout expire skipped:", err);
  }
}

/** Expire prior open session for this invoice before creating a new Checkout URL. */
export async function expireStoredCheckoutSessionForInvoice(
  invoiceId: string
): Promise<void> {
  if (!invoiceId.trim()) return;
  const prior = await redis.get(checkoutSessionRedisKey(invoiceId));
  if (prior) {
    await expireStripeCheckoutSession(prior);
    await redis.del(checkoutSessionRedisKey(invoiceId));
  }
}

export async function storeCheckoutSessionForInvoice(
  invoiceId: string,
  sessionId: string
): Promise<void> {
  if (!invoiceId.trim() || !sessionId.trim()) return;
  await redis.set(
    checkoutSessionRedisKey(invoiceId),
    sessionId,
    STRIPE_CHECKOUT_EXPIRES_SEC + 60
  );
}
