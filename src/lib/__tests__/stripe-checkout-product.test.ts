import { describe, expect, it } from "vitest";
import { buildStripeCheckoutProductCopy } from "@/lib/stripe-checkout-product";

describe("buildStripeCheckoutProductCopy", () => {
  it("uses visit summary instead of long invoice.description for Stripe name", () => {
    const copy = buildStripeCheckoutProductCopy({
      id: "inv-1",
      description:
        "Visit invoice — Demo curated — 02-demo-owner-today-pending — Demo Patient — 2026-06-01",
      visit_summary: {
        appointment_id: "appt-1",
        title: "Demo curated — 02-demo-owner-today-pending — Demo Patient",
        appointment_type_name: "Initial Consultation",
        category_label: "Demo curated — 02-demo-owner-today-pending",
        category_id: "cat-1",
        category_color: null,
        category_icon: null,
        patient_id: "pat-1",
        patient_label: "Demo Patient",
        when_label: "Mon, 01 Jun 2026 · 12:00 – 12:30",
        start_iso: "2026-06-01T10:00:00.000Z",
        end_iso: "2026-06-01T10:30:00.000Z",
        location_label: "Demo Clinic",
        treating_physician_label: "Dr. Demo Doctor",
        treating_physician_id: "doc-1",
        treating_physician_specialty: null,
        calendar_owner_id: null,
        calendar_owner_label: null,
        calendar_owner_specialty: null,
        is_telehealth: false,
      },
    });

    expect(copy.name).toContain("Initial Consultation");
    expect(copy.name).not.toContain("02-demo-owner-today-pending");
    expect(copy.description).toContain("Demo Patient");
    expect(copy.description).toContain("Dr. Demo Doctor");
  });
});
