/**
 * Stripe Client & Helpers
 *
 * Initializes Stripe if STRIPE_SECRET_KEY is available.
 * Provides helpers for creating checkout sessions and verifying webhooks.
 * Uses the Stripe HTTP API directly (no SDK) — all secrets stay server-side.
 */

import { createHmac, timingSafeEqual } from "crypto";

// File-local only — never re-exported so secrets cannot be imported by client bundles.
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
      // Redirect to the invoice-management section (segment → tab: "invoices").
      // Dedicated CP section pages read status=success on mount to refetch invoice data.
      success_url: `${APP_URL}/control-panel/invoice-management?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${APP_URL}/control-panel/invoice-management?status=cancelled`,
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
 * Verify a Stripe webhook payload using HMAC-SHA256 — mirrors the algorithm
 * used by `stripe.webhooks.constructEvent` without the full SDK.
 *
 * Stripe's `Stripe-Signature` header format:
 *   `t=<unix-timestamp>,v1=<hex-signature>[,v1=...]`
 *
 * Signed payload: `<timestamp>.<rawBody>`
 *
 * Throws if the signature is missing, the secret is unconfigured, or the
 * computed HMAC does not match (timing-safe comparison).
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string): unknown {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  // Parse t=... and v1=... fields from the header.
  const parts = signatureHeader.split(",");
  const tPart = parts.find((p) => p.startsWith("t="));
  const v1Parts = parts.filter((p) => p.startsWith("v1="));

  if (!tPart || v1Parts.length === 0) {
    throw new Error("Invalid Stripe-Signature header");
  }

  const timestamp = tPart.slice(2);
  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", STRIPE_WEBHOOK_SECRET)
    .update(signedPayload, "utf8")
    .digest("hex");

  // Accept if any v1= value matches — Stripe can send multiple signatures during key rotation.
  const matched = v1Parts.some((v1Part) => {
    const provided = v1Part.slice(3);
    try {
      const a = Buffer.from(expected, "hex");
      const b = Buffer.from(provided, "hex");
      return a.length === b.length && timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });

  if (!matched) {
    throw new Error("Stripe webhook signature verification failed");
  }

  return JSON.parse(rawBody) as unknown;
}
