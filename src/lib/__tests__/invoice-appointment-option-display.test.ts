import { describe, expect, it } from "vitest";
import {
  formatInvoiceVisitPickerMeta,
  invoiceVisitSummaryToDisplay,
} from "@/lib/invoice-appointment-option-display";
import type { InvoiceVisitSummary } from "@/lib/billing-types";

describe("formatInvoiceVisitPickerMeta", () => {
  it("joins when, type, category, and doctor", () => {
    const meta = formatInvoiceVisitPickerMeta({
      title: "Visit",
      patient_label: "Jane",
      when_label: "Mon 10:00",
      location_label: "Room 1",
      is_telehealth: false,
      appointment_type_name: "Consultation",
      category_label: "General",
      treating_physician_label: "Smith",
      calendar_owner_label: "Owner",
    });
    expect(meta).toContain("Mon 10:00");
    expect(meta).toContain("Dr. Smith");
  });
});

describe("invoiceVisitSummaryToDisplay", () => {
  it("maps summary fields for summary card", () => {
    const summary = {
      appointment_id: "a1",
      title: "Check-up",
      start_iso: "2026-06-01T10:00:00Z",
      end_iso: "2026-06-01T10:30:00Z",
      patient_label: "Jane Doe",
      when_label: "Tue 14:00",
      location_label: "Clinic",
      is_telehealth: true,
      category_label: "GP",
      category_id: "c1",
      category_color: "#fff",
      category_icon: "stethoscope",
      patient_id: "p1",
      patient_email: "j@test.com",
      treating_physician_id: "d1",
      treating_physician_label: "Adams",
      treating_physician_specialty: null,
      calendar_owner_id: null,
      calendar_owner_label: null,
      calendar_owner_specialty: null,
    } satisfies InvoiceVisitSummary;
    const display = invoiceVisitSummaryToDisplay(summary);
    expect(display.title).toBe("Check-up");
    expect(display.patient_label).toBe("Jane Doe");
    expect(display.category_id).toBe("c1");
  });
});
