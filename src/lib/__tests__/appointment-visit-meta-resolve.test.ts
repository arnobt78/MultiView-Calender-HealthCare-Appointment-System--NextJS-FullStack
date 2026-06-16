import { describe, expect, it } from "vitest";
import {
  resolveAppointmentVisitMetaBilling,
  resolveAppointmentVisitMetaFromFullAppointment,
} from "@/lib/appointment-visit-meta-resolve";
import type { FullAppointment } from "@/hooks/useAppointments";
import type { InvoiceRow } from "@/lib/billing-types";

function appt(overrides: Partial<FullAppointment>): FullAppointment {
  return {
    id: "a1",
    start: "2026-06-16T09:00:00Z",
    end: "2026-06-16T09:30:00Z",
    title: "Visit",
    status: "pending",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: null,
    location: null,
    patient: null,
    attachments: [],
    category: null,
    notes: null,
    user_id: "user-1",
    is_telehealth: true,
    ...overrides,
  } as FullAppointment;
}

describe("resolveAppointmentVisitMetaFromFullAppointment", () => {
  it("uses type price when set", () => {
    const result = resolveAppointmentVisitMetaFromFullAppointment(
      appt({
        appointment_type_name: "Video Visit",
        appointment_type_price_cents: 12000,
        duration_minutes: 30,
      })
    );
    expect(result.visitFeeCents).toBe(12000);
    expect(result.showVisitFeeEstimateHint).toBe(false);
    expect(result.durationMinutes).toBe(30);
    expect(result.appointmentTypeName).toBe("Video Visit");
  });

  it("falls back to doctor fee with estimate hint", () => {
    const result = resolveAppointmentVisitMetaFromFullAppointment(
      appt({
        appointment_type_price_cents: null,
        doctor_consultation_fee_cents: 8000,
      })
    );
    expect(result.visitFeeCents).toBe(8000);
    expect(result.showVisitFeeEstimateHint).toBe(true);
  });
});

describe("resolveAppointmentVisitMetaBilling", () => {
  it("shows invoice only when no payment row", () => {
    const invoice = {
      id: "inv-1",
      status: "sent",
      appointment_id: "a1",
      payments: [],
    } as unknown as InvoiceRow;
    const result = resolveAppointmentVisitMetaBilling(invoice);
    expect(result.showInvoice).toBe(true);
    expect(result.showPayment).toBe(false);
    expect(result.invoiceDisplayStatus).toBe("sent");
  });

  it("dedupes redundant paid invoice + succeeded payment", () => {
    const invoice = {
      id: "inv-1",
      status: "paid",
      appointment_id: "a1",
      payments: [{ id: "p1", status: "succeeded", created_at: "2026-01-02T00:00:00Z" }],
    } as unknown as InvoiceRow;
    const result = resolveAppointmentVisitMetaBilling(invoice);
    expect(result.showInvoice).toBe(false);
    expect(result.showPayment).toBe(true);
  });

  it("returns empty flags when invoice absent", () => {
    const result = resolveAppointmentVisitMetaBilling(null);
    expect(result.showInvoice).toBe(false);
    expect(result.showPayment).toBe(false);
  });
});
