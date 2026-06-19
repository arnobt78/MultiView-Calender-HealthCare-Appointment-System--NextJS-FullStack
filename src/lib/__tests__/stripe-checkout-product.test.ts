import { describe, expect, it } from "vitest";
import {
  buildStripeCheckoutProductCopy,
  formatStripeCheckoutVisitDescription,
} from "@/lib/stripe-checkout-product";

const baseSummary = {
  appointment_id: "appt-1",
  title: "Demo curated — 02-demo-owner-today-pending — Demo Patient",
  appointment_type_name: "Initial Consultation",
  duration_minutes: 30,
  appointment_type_duration_minutes: 30,
  category_label: "Primary Care & Preventive Medicine",
  category_id: "cat-1",
  category_color: null,
  category_icon: null,
  patient_id: "pat-1",
  patient_label: "Demo Patient",
  when_label: "Mon, 01 Jun 2026 · 12:00 – 12:30",
  start_iso: "2026-06-01T10:00:00.000Z",
  end_iso: "2026-06-01T10:30:00.000Z",
  location_label: "Demo Clinic",
  treating_physician_label: "Demo Doctor",
  treating_physician_id: "doc-1",
  treating_physician_specialty: "Medicine",
  calendar_owner_id: null,
  calendar_owner_label: null,
  calendar_owner_specialty: null,
  is_telehealth: false,
} as const;

describe("formatStripeCheckoutVisitDescription", () => {
  it("uses newline-separated lines with type, place, patient, physician, duration, issuer", () => {
    const desc = formatStripeCheckoutVisitDescription(baseSummary, {
      issuer_label: "Demo Admin",
    });
    const lines = desc.split("\n");

    expect(lines[0]).toBe("Initial Consultation Mon, 01 Jun 2026 · 12:00 – 12:30");
    expect(lines[1]).toBe("Demo Clinic — Primary Care & Preventive Medicine");
    expect(lines).toContain("Duration: 30 min");
    expect(lines).toContain("Patient: Demo Patient");
    expect(lines).toContain("Treating physician: Demo Doctor · Medicine");
    expect(lines).toContain("Issued by: Demo Admin");
  });
});

describe("buildStripeCheckoutProductCopy", () => {
  it("uses visit summary instead of long invoice.description for Stripe name", () => {
    const copy = buildStripeCheckoutProductCopy({
      id: "inv-1",
      issuer_label: "Demo Admin",
      description:
        "Visit invoice — Demo curated — 02-demo-owner-today-pending — Demo Patient — 2026-06-01",
      visit_summary: baseSummary,
    });

    expect(copy.name).toContain("Demo curated — 02-demo-owner-today-pending");
    expect(copy.name).not.toContain("Initial Consultation");
    expect(copy.description).toContain(
      "Initial Consultation Mon, 01 Jun 2026 · 12:00 – 12:30"
    );
    expect(copy.description).toContain("Demo Clinic — Primary Care & Preventive Medicine");
    expect(copy.description).toContain("\n");
    expect(copy.description).toContain("Issued by: Demo Admin");
  });
});
