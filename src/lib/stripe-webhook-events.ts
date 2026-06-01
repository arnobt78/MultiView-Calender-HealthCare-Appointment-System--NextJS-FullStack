/**
 * Stripe webhook types we process — CLI forwards all events; others ack immediately after signature verify.
 */

export const HANDLED_STRIPE_WEBHOOK_EVENT_TYPES = new Set<string>([
  "checkout.session.completed",
  "payment_intent.payment_failed",
  "charge.refunded",
]);

export function isHandledStripeWebhookEventType(type: string): boolean {
  return HANDLED_STRIPE_WEBHOOK_EVENT_TYPES.has(type);
}
