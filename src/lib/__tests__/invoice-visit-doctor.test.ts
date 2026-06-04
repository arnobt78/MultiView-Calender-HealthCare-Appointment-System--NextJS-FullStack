import { describe, expect, it } from "vitest";
import {
  invoiceCalendarOwnerDoctorFromSummary,
  invoiceTreatingDoctorFromSummary,
} from "@/lib/invoice-visit-doctor";
import type { InvoiceVisitSummary } from "@/lib/billing-types";

const baseSummary = (): InvoiceVisitSummary => ({
  appointment_id: "a1",
  title: "Visit",
  start_iso: "2026-06-01T10:00:00.000Z",
  end_iso: "2026-06-01T10:30:00.000Z",
  when_label: "Mon · 10:00",
  location_label: "Clinic",
  is_telehealth: false,
  patient_id: "p1",
  patient_label: "Pat",
  category_id: null,
  category_label: null,
  category_color: null,
  category_icon: null,
  treating_physician_id: "d1",
  treating_physician_label: "Dr. A",
  treating_physician_email: "a@test.com",
  treating_physician_specialty: "GP",
  treating_physician_image: "https://cdn.example/a.png",
  calendar_owner_id: "d2",
  calendar_owner_label: "Dr. B",
  calendar_owner_email: "b@test.com",
  calendar_owner_specialty: null,
  calendar_owner_image: null,
});

describe("invoiceTreatingDoctorFromSummary", () => {
  it("maps image and email for avatar", () => {
    const doc = invoiceTreatingDoctorFromSummary(baseSummary());
    expect(doc?.image).toBe("https://cdn.example/a.png");
    expect(doc?.email).toBe("a@test.com");
  });

  it("returns null when label missing", () => {
    expect(
      invoiceTreatingDoctorFromSummary({
        ...baseSummary(),
        treating_physician_id: "d1",
        treating_physician_label: null,
      })
    ).toBeNull();
  });
});

describe("invoiceCalendarOwnerDoctorFromSummary", () => {
  it("skips when same as treating", () => {
    const s = baseSummary();
    s.calendar_owner_id = "d1";
    expect(invoiceCalendarOwnerDoctorFromSummary(s)).toBeNull();
  });

  it("returns owner when distinct", () => {
    const doc = invoiceCalendarOwnerDoctorFromSummary(baseSummary());
    expect(doc?.id).toBe("d2");
    expect(doc?.display_name).toBe("Dr. B");
  });
});
