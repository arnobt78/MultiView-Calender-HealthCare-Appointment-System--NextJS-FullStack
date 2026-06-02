/**
 * Contract tests for GET /api/billing/appointment-options and POST /api/invoices 409.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/session", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/rbac", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/rbac")>();
  return {
    ...actual,
    getUserRole: vi.fn(),
  };
});

vi.mock("@/lib/billing-appointment-options-load", () => ({
  fetchBillingAppointmentOptions: vi.fn(),
}));

vi.mock("@/lib/invoice-access", () => ({
  canCreateInvoiceForAppointment: vi.fn(),
  resolveInvoiceBillingUserId: vi.fn(),
}));

vi.mock("@/lib/billing-appointment-eligibility", () => ({
  assertAppointmentEligibleForNewInvoice: vi.fn(),
}));

vi.mock("@/lib/invoice-organization-resolve", () => ({
  resolveInvoiceOrganizationId: vi.fn(),
}));

vi.mock("@/lib/billing-cache", () => ({
  invalidateBillingRedisCaches: vi.fn(),
  resolvePatientPortalUserIdForAppointment: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    invoice: {
      create: vi.fn(),
    },
  },
}));

import { getSessionUser } from "@/lib/session";
import { getUserRole } from "@/lib/rbac";
import { fetchBillingAppointmentOptions } from "@/lib/billing-appointment-options-load";
import { canCreateInvoiceForAppointment, resolveInvoiceBillingUserId } from "@/lib/invoice-access";
import { assertAppointmentEligibleForNewInvoice } from "@/lib/billing-appointment-eligibility";
import { resolveInvoiceOrganizationId } from "@/lib/invoice-organization-resolve";
import { prisma } from "@/lib/prisma";
import { GET } from "@/app/api/billing/appointment-options/route";
import { POST } from "@/app/api/invoices/route";

const ADMIN = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
const APPT = "c40e5d58-6701-4ded-b085-d3cdaf62f9e3";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/billing/appointment-options", () => {
  it("returns 401 when unauthenticated", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    const res = await GET(new NextRequest("http://localhost/api/billing/appointment-options"));
    expect(res.status).toBe(401);
  });

  it("returns 403 for patient role", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: "patient-1",
      email: "p@test.com",
    });
    vi.mocked(getUserRole).mockResolvedValue("patient");
    const res = await GET(new NextRequest("http://localhost/api/billing/appointment-options"));
    expect(res.status).toBe(403);
  });

  it("returns eligible options for admin", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: ADMIN,
      email: "admin@test.com",
    });
    vi.mocked(getUserRole).mockResolvedValue("admin");
    vi.mocked(fetchBillingAppointmentOptions).mockResolvedValue([
      {
        id: APPT,
        title: "Visit",
        start: "2026-06-01T10:00:00.000Z",
        end: "2026-06-01T11:00:00.000Z",
        owner_id: ADMIN,
        patient_label: "Demo Patient",
        eligible: true,
        block_reason: null,
        invoice_id: null,
        invoice_status: null,
        display_status: null,
        amount_cents: null,
        currency: null,
        suggested_amount_cents: 9250,
      },
    ]);

    const res = await GET(
      new NextRequest("http://localhost/api/billing/appointment-options")
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.options).toHaveLength(1);
    expect(body.options[0].eligible).toBe(true);
    expect(fetchBillingAppointmentOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionUserId: ADMIN,
        role: "admin",
        includeBilled: false,
      })
    );
  });

  it("passes includeBilled for admin query param", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: ADMIN,
      email: "admin@test.com",
    });
    vi.mocked(getUserRole).mockResolvedValue("admin");
    vi.mocked(fetchBillingAppointmentOptions).mockResolvedValue([]);

    await GET(
      new NextRequest(
        "http://localhost/api/billing/appointment-options?includeBilled=1"
      )
    );
    expect(fetchBillingAppointmentOptions).toHaveBeenCalledWith(
      expect.objectContaining({ includeBilled: true })
    );
  });
});

describe("POST /api/invoices duplicate guard", () => {
  it("returns 409 when visit already has active invoice", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: ADMIN,
      email: "admin@test.com",
    });
    vi.mocked(getUserRole).mockResolvedValue("admin");
    vi.mocked(canCreateInvoiceForAppointment).mockResolvedValue(true);
    vi.mocked(resolveInvoiceBillingUserId).mockResolvedValue(ADMIN);
    vi.mocked(assertAppointmentEligibleForNewInvoice).mockResolvedValue({
      ok: false,
      status: 409,
      message: "duplicate",
      invoiceId: "inv-existing",
    });

    const res = await POST(
      new NextRequest("http://localhost/api/invoices", {
        method: "POST",
        body: JSON.stringify({
          amount: 50,
          appointment_id: APPT,
        }),
      })
    );
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.invoice_id).toBe("inv-existing");
    expect(prisma.invoice.create).not.toHaveBeenCalled();
  });

  it("creates draft when eligible", async () => {
    vi.mocked(getSessionUser).mockResolvedValue({
      userId: ADMIN,
      email: "admin@test.com",
    });
    vi.mocked(getUserRole).mockResolvedValue("admin");
    vi.mocked(canCreateInvoiceForAppointment).mockResolvedValue(true);
    vi.mocked(resolveInvoiceBillingUserId).mockResolvedValue(ADMIN);
    vi.mocked(assertAppointmentEligibleForNewInvoice).mockResolvedValue({ ok: true });
    vi.mocked(resolveInvoiceOrganizationId).mockResolvedValue({
      organizationId: null,
    });
    vi.mocked(prisma.invoice.create).mockResolvedValue({
      id: "new-inv",
      user_id: ADMIN,
      amount: 5000,
      currency: "eur",
      status: "draft",
      appointment_id: APPT,
      description: null,
      due_date: null,
      paid_at: null,
      created_at: new Date(),
      payments: [],
    } as never);

    const res = await POST(
      new NextRequest("http://localhost/api/invoices", {
        method: "POST",
        body: JSON.stringify({
          amount: 50,
          appointment_id: APPT,
        }),
      })
    );
    expect(res.status).toBe(201);
    expect(prisma.invoice.create).toHaveBeenCalled();
  });
});
