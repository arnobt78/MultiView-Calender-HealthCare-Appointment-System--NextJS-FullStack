import { describe, expect, it } from "vitest";
import {
  HANDLED_STRIPE_WEBHOOK_EVENT_TYPES,
  isHandledStripeWebhookEventType,
} from "@/lib/stripe-webhook-events";

describe("stripe-webhook-events", () => {
  it("only processes checkout, failure, and refund events", () => {
    expect(HANDLED_STRIPE_WEBHOOK_EVENT_TYPES.size).toBe(3);
    expect(isHandledStripeWebhookEventType("checkout.session.completed")).toBe(true);
    expect(isHandledStripeWebhookEventType("charge.succeeded")).toBe(false);
    expect(isHandledStripeWebhookEventType("payment_intent.created")).toBe(false);
  });
});
