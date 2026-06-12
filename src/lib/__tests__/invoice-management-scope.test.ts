import { describe, expect, it } from "vitest";
import {
  buildInvoiceManagementQueryString,
  filterInvoicesByDoctorScope,
  invoiceManagementFilterKeyStable,
  invoiceMatchesDoctorScope,
  parseInvoiceManagementScopeFromSearchParams,
} from "@/lib/invoice-management-scope";
import type { InvoiceRow } from "@/lib/billing-types";

const DOC = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OWNER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ORG = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

const base: InvoiceRow = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "22222222-2222-4222-8222-222222222222",
  amount: 1000,
  currency: "eur",
  status: "draft",
  created_at: "2026-01-01T00:00:00.000Z",
  payments: [],
};

describe("invoice-management-scope", () => {
  it("parse all scope from empty params", () => {
    expect(parseInvoiceManagementScopeFromSearchParams({}, "admin")).toEqual({
      scope: "all",
    });
  });

  it("parse org scope from orgId param", () => {
    expect(
      parseInvoiceManagementScopeFromSearchParams(
        { scope: "org", orgId: ORG },
        "admin"
      )
    ).toEqual({ scope: "org", orgId: ORG });
  });

  it("parse doctor scope from doctorId param", () => {
    expect(
      parseInvoiceManagementScopeFromSearchParams(
        { scope: "doctor", doctorId: DOC },
        "admin"
      )
    ).toEqual({ scope: "doctor", doctorId: DOC });
  });

  it("rejects invalid UUIDs", () => {
    expect(
      parseInvoiceManagementScopeFromSearchParams({ orgId: "not-a-uuid" }, "admin")
    ).toEqual({ scope: "all" });
  });

  it("buildInvoiceManagementQueryString round-trip", () => {
    const filter = { scope: "org" as const, orgId: ORG };
    const qs = buildInvoiceManagementQueryString(filter);
    expect(qs).toContain("scope=org");
    expect(qs).toContain(`orgId=${ORG}`);
    expect(
      parseInvoiceManagementScopeFromSearchParams(
        new URLSearchParams(qs),
        "admin"
      )
    ).toEqual(invoiceManagementFilterKeyStable(filter));
  });

  it("invoiceMatchesDoctorScope — issuer", () => {
    expect(invoiceMatchesDoctorScope({ ...base, user_id: DOC }, DOC)).toBe(true);
  });

  it("invoiceMatchesDoctorScope — treating physician", () => {
    expect(
      invoiceMatchesDoctorScope(
        {
          ...base,
          visit_summary: {
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
            treating_physician_id: DOC,
            treating_physician_label: "Dr A",
            treating_physician_specialty: null,
            calendar_owner_id: null,
            calendar_owner_label: null,
            calendar_owner_specialty: null,
            appointment_type_name: null,
          },
        },
        DOC
      )
    ).toBe(true);
  });

  it("invoiceMatchesDoctorScope — calendar owner", () => {
    expect(
      invoiceMatchesDoctorScope(
        {
          ...base,
          visit_summary: {
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
            treating_physician_id: null,
            treating_physician_label: null,
            treating_physician_specialty: null,
            calendar_owner_id: OWNER,
            calendar_owner_label: "Owner",
            calendar_owner_specialty: null,
            appointment_type_name: null,
          },
        },
        OWNER
      )
    ).toBe(true);
  });

  it("filterInvoicesByDoctorScope returns matching rows only", () => {
    const issuerMatch = { ...base, user_id: DOC };
    const noMatch = { ...base, user_id: "99999999-9999-4999-8999-999999999999" };
    expect(filterInvoicesByDoctorScope([issuerMatch, noMatch], DOC)).toEqual([
      issuerMatch,
    ]);
  });
});
