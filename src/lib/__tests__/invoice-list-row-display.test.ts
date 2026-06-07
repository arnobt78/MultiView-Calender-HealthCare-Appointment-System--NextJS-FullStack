import { describe, expect, it } from "vitest";
import {
  getInvoiceAppointmentTitle,
  isSeededDemoAppointmentTitle,
  resolveInvoiceDetailHeaderTitle,
  resolveInvoiceLocationDisplay,
} from "@/lib/invoice-list-row-display";
import type { InvoiceVisitSummary } from "@/lib/billing-types";

const summary: InvoiceVisitSummary = {
  appointment_id: "a1",
  title: "Testing Custom Date",
  start_iso: "2026-06-02T14:45:00.000Z",
  end_iso: "2026-06-02T15:45:00.000Z",
  when_label: "Tue, 02 Jun 2026 · 14:45 – 15:45",
  location_label: "Berlin",
  is_telehealth: false,
  patient_id: "p1",
  patient_label: "Demo Patient",
  category_id: "cat-1",
  category_label: "Mental Health & Psychiatry",
  category_color: "#6366f1",
  category_icon: null,
  treating_physician_id: null,
  treating_physician_label: null,
  treating_physician_specialty: null,
  calendar_owner_id: null,
  calendar_owner_label: null,
  calendar_owner_specialty: null,
};

describe("getInvoiceAppointmentTitle", () => {
  it("uses visit title instead of category — patient composite", () => {
    expect(
      getInvoiceAppointmentTitle({
        id: "inv-1",
        description: "Demo",
        visit_summary: summary,
      })
    ).toBe("Testing Custom Date");
  });

  it("falls back to list title for demo curated seed slug", () => {
    expect(
      getInvoiceAppointmentTitle({
        id: "inv-1",
        description: "Demo curated invoice",
        visit_summary: {
          ...summary,
          title: "Demo curated — 01-admin-treating-demo-paid — Demo Patient",
          appointment_type_name: "Follow-up Visit",
        },
      })
    ).toBe("Follow-up Visit — Demo Patient");
  });
});

describe("isSeededDemoAppointmentTitle", () => {
  it("detects demo curated prefix", () => {
    expect(isSeededDemoAppointmentTitle("Demo curated — slug")).toBe(true);
    expect(isSeededDemoAppointmentTitle("Testing Custom Date")).toBe(false);
  });
});

describe("resolveInvoiceDetailHeaderTitle", () => {
  it("delegates to appointment title resolver", () => {
    expect(
      resolveInvoiceDetailHeaderTitle({
        id: "inv-1",
        description: "Demo",
        visit_summary: summary,
      })
    ).toBe("Testing Custom Date");
  });
});

describe("resolveInvoiceLocationDisplay", () => {
  it("hides telehealth placeholder location", () => {
    expect(
      resolveInvoiceLocationDisplay({
        ...summary,
        is_telehealth: true,
        location_label: "Video call (telehealth)",
      })
    ).toBeNull();
  });
});
