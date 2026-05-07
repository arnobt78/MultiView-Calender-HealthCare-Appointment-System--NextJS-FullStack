/**
 * Stripe Client & Helpers
 * 
 * Initializes Stripe if STRIPE_SECRET_KEY is available.
 * Provides helpers for creating checkout sessions and handling webhooks.
 */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface StripeSession {
  id: string;
  url: string;
}

/**
 * Create a Stripe Checkout session for an invoice
 */
export async function createCheckoutSession({
  invoiceId,
  amount,
  currency,
  description,
  customerEmail,
}: {
  invoiceId: string;
  amount: number; // in cents
  currency: string;
  description: string;
  customerEmail: string;
}): Promise<StripeSession> {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing)");
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "payment_method_types[0]": "card",
      "line_items[0][price_data][currency]": currency,
      "line_items[0][price_data][product_data][name]": description,
      "line_items[0][price_data][unit_amount]": String(amount),
      "line_items[0][quantity]": "1",
      mode: "payment",
      customer_email: customerEmail,
      success_url: `${APP_URL}/billing?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${APP_URL}/billing?status=cancelled`,
      "metadata[invoice_id]": invoiceId,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Stripe error: ${err}`);
  }

  const session = await response.json();
  return { id: session.id, url: session.url };
}

/**
 * Parse a Stripe webhook payload.
 *
 * ⚠️  MVP placeholder — this does NOT verify the Stripe-Signature header.
 * For production, replace with:
 *   `stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)`
 * and reject on `WebhookSignatureVerificationError`.
 */
export async function verifyWebhookSignature(
  body: string,
  _signature: string
): Promise<unknown> {
  if (!STRIPE_WEBHOOK_SECRET) {
    console.warn("STRIPE_WEBHOOK_SECRET not set — webhook payloads are unverified");
  }
  return JSON.parse(body) as unknown;
}

export { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET };
