import { describe, expect, it } from "vitest";
import {
  canSubmitCreateInvoice,
  buildInvoiceCreateBody,
  buildInvoiceUpdateBody,
  formatSuggestedAmountEur,
} from "@/lib/invoice-form-guards";
import type { InvoiceAppointmentOptionRow } from "@/lib/billing-types";

const eligibleOption = {
  id: "appt-1",
  eligible: true,
  suggested_amount_cents: 7500,
} as InvoiceAppointmentOptionRow;

const ineligibleOption = {
  id: "appt-1",
  eligible: false,
} as InvoiceAppointmentOptionRow;

describe("canSubmitCreateInvoice", () => {
  it("requires positive amount and linked appointment", () => {
    expect(
      canSubmitCreateInvoice({
        amount: "0",
        apptId: "appt-1",
        selection: eligibleOption,
      })
    ).toBe(false);
    expect(
      canSubmitCreateInvoice({
        amount: "75.00",
        apptId: "",
        presetAppointmentId: "appt-1",
        selection: eligibleOption,
        requirePresetSelection: true,
      })
    ).toBe(true);
  });

  it("blocks ineligible selection in picker mode", () => {
    expect(
      canSubmitCreateInvoice({
        amount: "75.00",
        apptId: "appt-1",
        selection: ineligibleOption,
      })
    ).toBe(false);
  });

  it("requires eligible selection in preset mode", () => {
    expect(
      canSubmitCreateInvoice({
        amount: "75.00",
        apptId: "",
        presetAppointmentId: "appt-1",
        selection: null,
        requirePresetSelection: true,
      })
    ).toBe(false);
    expect(
      canSubmitCreateInvoice({
        amount: "75.00",
        apptId: "",
        presetAppointmentId: "appt-1",
        selection: eligibleOption,
        requirePresetSelection: true,
      })
    ).toBe(true);
  });
});

describe("buildInvoiceCreateBody", () => {
  it("maps form fields to API body", () => {
    expect(
      buildInvoiceCreateBody({
        amount: "75.00",
        description: " Consult ",
        dueDate: "2026-07-01",
        apptId: "",
        presetAppointmentId: "appt-1",
      })
    ).toEqual({
      amount: 75,
      description: "Consult",
      due_date: "2026-07-01",
      appointment_id: "appt-1",
    });
  });
});

describe("buildInvoiceUpdateBody", () => {
  it("clears due date when empty", () => {
    expect(buildInvoiceUpdateBody("Note", "")).toEqual({
      description: "Note",
      due_date: null,
    });
  });
});

describe("formatSuggestedAmountEur", () => {
  it("formats cents to EUR string", () => {
    expect(formatSuggestedAmountEur(7500)).toBe("75.00");
    expect(formatSuggestedAmountEur(0)).toBe("");
  });
});
