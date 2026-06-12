import { describe, expect, it } from "vitest";
import {
  buildPrismaDoctorInvoiceWhere,
  filterInvoicesByDoctorScope,
  invoiceMatchesDoctorScope,
  resolveDoctorIdsFromInvoice,
} from "@/lib/invoice-doctor-scope";
import type { InvoiceRow, InvoiceVisitSummary } from "@/lib/billing-types";

const DOC = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const OWNER = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

const base: InvoiceRow = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: OTHER,
  amount: 1000,
  currency: "eur",
  status: "draft",
  created_at: "2026-01-01T00:00:00.000Z",
  payments: [],
};

function visitSummary(
  partial: Partial<Pick<InvoiceVisitSummary, "treating_physician_id" | "calendar_owner_id">>
): InvoiceVisitSummary {
  return {
    appointment_id: "appt",
    title: "Visit",
    location_label: "",
    is_telehealth: false,
    patient_id: null,
    patient_label: null,
    patient_email: null,
    patient_birth_date: null,
    patient_care_level: null,
    when_label: "Today",
    start_iso: "2026-01-15T10:00:00.000Z",
    end_iso: "2026-01-15T11:00:00.000Z",
    category_id: null,
    category_label: null,
    category_color: null,
    category_icon: null,
    treating_physician_label: null,
    treating_physician_specialty: null,
    calendar_owner_label: null,
    calendar_owner_specialty: null,
    appointment_type_name: null,
    treating_physician_id: partial.treating_physician_id ?? null,
    calendar_owner_id: partial.calendar_owner_id ?? null,
  };
}

describe("invoice-doctor-scope", () => {
  it("buildPrismaDoctorInvoiceWhere — issuer OR appointment owner/treating", () => {
    expect(buildPrismaDoctorInvoiceWhere(DOC)).toEqual({
      OR: [
        { user_id: DOC },
        {
          appointment: {
            OR: [{ owner_id: DOC }, { treating_physician_id: DOC }],
          },
        },
      ],
    });
  });

  it("invoiceMatchesDoctorScope — issuer, treating, calendar owner", () => {
    expect(invoiceMatchesDoctorScope({ ...base, user_id: DOC }, DOC)).toBe(true);
    expect(
      invoiceMatchesDoctorScope(
        {
          ...base,
          visit_summary: visitSummary({
            treating_physician_id: DOC,
            calendar_owner_id: OWNER,
          }),
        },
        DOC
      )
    ).toBe(true);
    expect(
      invoiceMatchesDoctorScope(
        {
          ...base,
          visit_summary: visitSummary({ calendar_owner_id: DOC }),
        },
        DOC
      )
    ).toBe(true);
    expect(invoiceMatchesDoctorScope(base, DOC)).toBe(false);
  });

  it("resolveDoctorIdsFromInvoice — unique issuer + visit ids", () => {
    expect(
      resolveDoctorIdsFromInvoice({
        ...base,
        user_id: DOC,
        visit_summary: visitSummary({
          treating_physician_id: DOC,
          calendar_owner_id: OWNER,
        }),
      })
    ).toEqual([DOC, OWNER]);
  });

  it("filterInvoicesByDoctorScope", () => {
    const invoices = [
      { ...base, id: "1", user_id: DOC },
      { ...base, id: "2" },
    ];
    expect(filterInvoicesByDoctorScope(invoices, DOC).map((i) => i.id)).toEqual(["1"]);
  });
});
