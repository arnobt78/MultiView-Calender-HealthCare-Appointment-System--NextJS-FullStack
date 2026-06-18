import { describe, expect, it } from "vitest";
import {
  formatInvoiceVisitMetaTextLine,
  invoiceAppointmentOptionToMetaInput,
  invoiceVisitSummaryToMetaInput,
  resolveInvoiceVisitMetaIcons,
} from "@/lib/invoice-visit-meta-line";

describe("invoice visit meta line", () => {
  it("prefers when_label for compact text line", () => {
    const line = formatInvoiceVisitMetaTextLine({
      when_label: "Mon 10:00",
      location_label: "Room 2",
      is_telehealth: false,
    });
    expect(line).toBe("Mon 10:00 · Room 2");
  });

  it("builds icon labels from ISO when when_label missing", () => {
    const icons = resolveInvoiceVisitMetaIcons(
      invoiceVisitSummaryToMetaInput({
        appointment_id: "a1",
        title: "V",
        start_iso: "2026-06-15T09:00:00.000Z",
        end_iso: "2026-06-15T09:30:00.000Z",
        when_label: "",
        location_label: "Clinic A",
        is_telehealth: false,
        patient_id: null,
        patient_label: null,
        category_id: null,
        category_label: null,
        category_color: null,
        category_icon: null,
        treating_physician_id: null,
        treating_physician_label: null,
        treating_physician_specialty: null,
        calendar_owner_id: null,
        calendar_owner_label: null,
        calendar_owner_specialty: null,
      })
    );
    expect(icons.dateLabel).toBeTruthy();
    expect(icons.timeLabel).toContain("–");
    expect(icons.locationLabel).toBe("Clinic A");
  });

  it("maps appointment option start/end to meta input", () => {
    const input = invoiceAppointmentOptionToMetaInput({
      start: "2026-06-15T09:00:00.000Z",
      end: "2026-06-15T09:30:00.000Z",
      when_label: "Tue 14:00",
      location_label: "Wing B",
      is_telehealth: true,
      title: "Follow-up",
      appointment_type_name: "Consultation",
      duration_minutes: 30,
      appointment_type_duration_minutes: 45,
    });
    expect(input.is_telehealth).toBe(true);
    expect(input.appointment_type_name).toBe("Consultation");
    expect(input.duration_minutes).toBe(30);
    expect(formatInvoiceVisitMetaTextLine(input)).toBe("Tue 14:00");
  });

  it("carries visit type fields from invoice visit summary", () => {
    const input = invoiceVisitSummaryToMetaInput({
      appointment_id: "a1",
      title: "V",
      start_iso: "2026-06-15T09:00:00.000Z",
      end_iso: "2026-06-15T09:30:00.000Z",
      when_label: "",
      location_label: "Clinic A",
      is_telehealth: false,
      patient_id: null,
      patient_label: null,
      category_id: null,
      category_label: null,
      category_color: null,
      category_icon: null,
      treating_physician_id: null,
      treating_physician_label: null,
      treating_physician_specialty: null,
      calendar_owner_id: null,
      calendar_owner_label: null,
      calendar_owner_specialty: null,
      appointment_type_name: "Consultation",
      duration_minutes: 30,
    });
    expect(input.appointment_type_name).toBe("Consultation");
    expect(input.duration_minutes).toBe(30);
  });
});
